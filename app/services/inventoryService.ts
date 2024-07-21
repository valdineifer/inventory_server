import { json } from '@remix-run/node';
import { eq } from 'drizzle-orm';
import DeepDiff from 'deep-diff';
import { db } from '~/database/db';
import { computer, computerLog, laboratory } from '~/database/schema';
import { ComputerInfo } from '~/types/models';
import sendMail from '~/lib/mailer';

type ComputerInsert = typeof computer.$inferInsert & {
  info: ComputerInfo;
};

export async function inventory(data: ComputerInsert) {
  const computerFoundByToken = await db.query.computer.findFirst({
    where: (computer, { eq }) => eq(computer.token, data.token!),
  });

  if (data.info?.laboratoryCode) {
    data.laboratoryId = await findOrCreateLaboratory(data.info.laboratoryCode);
  }

  if (!computerFoundByToken) {
    const computerFoundByMAC = await db.query.computer.findFirst({
      where: (computer, { eq }) => eq(computer.mac, data.mac),
    });

    if (computerFoundByMAC) {
      return json({ error: 'MAC address already registered' }, 403);
    }
  }

  const existingComputer = computerFoundByToken;

  if (existingComputer) {
    const [updated] = await db.update(computer)
      .set({
        name: data.info.hostname,
        info: data.info,
        updatedAt: new Date(),
      })
      .where(eq(computer.id, existingComputer.id))
      .returning({
        id: computer.id,
        mac: computer.mac,
      });

    const hasDifferences = await checkForChanges(existingComputer.info!, data.info);

    if (hasDifferences) {
      await db.insert(computerLog).values({
        computerId: existingComputer.id,
        oldObject: existingComputer.info,
      }).returning({ id: computerLog.id });
    }

    return json(updated);
  }

  const [inserted] = await db.insert(computer).values(data)
    .returning({ id: computer.id });

  return json(inserted, 201);
}

async function findOrCreateLaboratory(laboratoryCode: string) {
  const lab = await db.query.laboratory.findFirst({
    columns: { id: true },
    where: (laboratory, { eq }) => eq(laboratory.code, laboratoryCode)
  });

  if (lab) {
    return lab.id;
  } else {
    const [{ id }] = await db.insert(laboratory).values({
      code: laboratoryCode,
    }).returning({ id: laboratory.id });

    return id;
  }
}

async function checkForChanges(oldObject: ComputerInfo, newObject: ComputerInfo) {
  const diff = DeepDiff.diff(oldObject, newObject);

  if (!diff) {
    return false;
  }

  diff.forEach((obj) => {
    if (obj.kind === 'E' && obj.path?.includes('disk') && obj.path?.includes('used')) {
      const diskDiff = Math.abs(Number(obj.lhs || 0) - Number(obj.rhs));

      if (diskDiff > 2e9) { // 2GB
        sendMail({
          subject: 'Inventário - Computador com alteração significativa no armazenamento',
          text: `
            O computador ${newObject.hostname} teve uma alteração significativa no
            armazenamento do disco.

            MAC: ${newObject.mac}
            IP: ${newObject.ip}
          `,
        });
      }
    }
  });

  return true;
}