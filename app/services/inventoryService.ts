import { json } from '@remix-run/node';
import { eq } from 'drizzle-orm';
import DeepDiff from 'deep-diff';
import { db } from '~/database/db';
import { computer, computerLog, laboratory } from '~/database/schema';
import { ComputerInfo, Settings, Status } from '~/types/models';
import sendMail from '~/lib/mailer';
import { getSettings } from './settingsService';
import logger from '~/utils/logger';
import { GB_UNIT_IN_BYTES } from '~/types/consts';
import { getUsersToSendMail } from './userService';

type ComputerInsert = typeof computer.$inferInsert & {
  info: ComputerInfo;
};

export async function inventory(data: ComputerInsert) {
  const settings = await getSettings();

  if (settings.enableRegistration === false) {
    return json({ error: 'Operation not allowed' }, 403);
  }

  const existingComputer = await db.query.computer.findFirst({
    where: (computer, { eq, or }) => or(
      eq(computer.token, data.token!),
      eq(computer.mac, data.mac),
    ),
    with: {
      laboratory: {
        columns: {
          settings: true,
        },
      },
    },
  });

  if (
    existingComputer
    && (
      existingComputer.token !== data.token!
      || existingComputer.mac !== data.mac
    )
  ) {
    return json({ error: 'Forbidden' }, 403);
  }

  if (!existingComputer) {
    const computerFoundByMAC = await db.query.computer.findFirst({
      where: (computer, { eq }) => eq(computer.mac, data.mac),
    });

    if (computerFoundByMAC) {
      return json({ error: 'MAC address already registered' }, 403);
    }
  }

  if (data.info?.laboratoryCode) {
    data.laboratoryId = await findOrCreateLaboratory(data.info.laboratoryCode);
  }

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

    const mergedSettings = {
      ...settings,
      ...existingComputer.laboratory?.settings,
    };

    const hasDifferences = _checkForChanges(existingComputer.info!, data.info, mergedSettings);

    if (hasDifferences) {
      await db.insert(computerLog).values({
        computerId: existingComputer.id,
        oldObject: existingComputer.info,
      }).returning({ id: computerLog.id });
    }

    return json(updated);
  }

  data.status = settings.autoApprove !== false ? Status.verified : Status.unverified;

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

function _checkForChanges(oldObject: ComputerInfo, newObject: ComputerInfo, settings: Settings) {
  const diff = DeepDiff.diff(oldObject, newObject);

  if (!diff) {
    return false;
  }

  _checkForMinDiskSpace(newObject, settings);

  return true;
}

async function _checkForMinDiskSpace(newObject: ComputerInfo, settings?: Settings) {
  const mainDisk = newObject.disks.find(disk => disk.mountpoint === '/');

  const minimumDiskSpaceInGB = settings?.minimumDiskSpaceInGigaForAlert || 20;

  if (mainDisk?.free && mainDisk.free < (minimumDiskSpaceInGB * GB_UNIT_IN_BYTES)) {
    const emails = await getUsersToSendMail();

    const freeSpaceInGB = (mainDisk.free / GB_UNIT_IN_BYTES).toFixed(2);
    const totalSpaceInGB = (mainDisk.total / GB_UNIT_IN_BYTES).toFixed(2);

    sendMail({
      to: emails,
      subject: 'Inventário - Computador com pouco espaço livre em disco',
      text: `
        O computador ${newObject.hostname} atingiu o espaço livre mínimo de disco configurado para ele.
        Atualmente, ele possui ${freeSpaceInGB}GB em espaço livre (na partição associada ao diretório raiz), no total de ${totalSpaceInGB}GB.

        MAC: ${newObject.mac}
        IP: ${newObject.ip}
      `,
    })
      .then(_ => logger.info('email sent for minimum disk space'))
      .catch(reason => (
        logger.error('error in email for minimum disk space: ' + JSON.stringify(reason))
      ));
  }
}