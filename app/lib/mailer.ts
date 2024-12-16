import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: String(process.env.MAIL_HOST) || undefined,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.NODE_ENV === 'production',
  auth: {
    user: String(process.env.MAIL_USER) || undefined,
    pass: String(process.env.MAIL_PASS) || undefined,
  },
});

export default async function sendMail({
  to, subject, text, html,
}: {
  to: string[], subject: string, text?: string, html?: string,
}) {
  if (to.length === 0) {
    return;
  }

  const fromMail = process.env.MAIL_FROM || 'naoresponda@inventario.app.ic.ufba.br';

  return transporter.sendMail({
    from: `Sistema de Inventário de Computadores<${fromMail}>`, // sender address
    to, // list of receivers
    subject, // Subject line
    text, // plain text body
    html, // html body
  });
}