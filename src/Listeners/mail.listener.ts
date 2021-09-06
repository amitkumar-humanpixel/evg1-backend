import * as nodemailer from 'nodemailer';
import { Mailer } from '../Helper/mail.helper';
const mailer = new Mailer();
mailer.on('mail.send', async (response: any) => {
  const isMailSent = process.env.MAILSENT as unknown as boolean;
  if (isMailSent) {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    const mail = await transporter.sendMail(response);
    console.log(mail);
    console.log('sent');
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(mail));
  }
});
export function mailSender(
  email: string,
  first_name: string,
  last_name: string,
  practice_name: string,
  event_name: string,
  link: any,
) {
  mailer.mailSender(
    email,
    first_name,
    last_name,
    practice_name,
    event_name,
    link,
  );
}
export function mailSenderForSupervisorRegistration(
  reciverFirstName: string,
  reciverLastName: string,
  reciverEmail: string,
  senderFirstName: string,
  senderLastName: string,
  email: string,
  firstName: string,
  lastName: string,
) {
  console.log(
    'reciverFirstName:: ' +
      reciverFirstName +
      'reciverLastName:: ' +
      reciverLastName +
      'reciverEmail:: ' +
      reciverEmail +
      'senderFirstName:: ' +
      senderFirstName +
      'senderLastName:: ' +
      senderLastName +
      'email:: ' +
      email +
      'firstName:: ' +
      firstName +
      'lastName:: ' +
      lastName,
  );
  mailer.mailSenderForSupervisorRegistration(
    reciverFirstName,
    reciverLastName,
    reciverEmail,
    senderFirstName,
    senderLastName,
    email,
    firstName,
    lastName,
  );
}
