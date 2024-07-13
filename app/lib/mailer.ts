import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: String(process.env.MAIL_HOST) || undefined,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: String(process.env.MAIL_USER) || undefined,
    pass: String(process.env.MAIL_PASS) || undefined,
  },
});

export default async function sendMail({
  to, subject, text, html,
}: {
  to?: string[], subject: string, text?: string, html?: string,
}) {
  const recipientsList = [
    ...(to || []),
    ...String(process.env.MAIL_TO).split(','),
  ];

  return transporter.sendMail({
    from: 'Sistema de Inventário <inventario@ufba.br>', // sender address
    to: recipientsList, // list of receivers
    subject, // Subject line
    text, // plain text body
    html, // html body
  });
}