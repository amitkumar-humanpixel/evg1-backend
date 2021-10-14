import { mailTemplate } from '../Templates/mail.template';
import { mailTemplateForSupervisorRegistor } from '../Templates/supervisorRegistration.template';
// import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { onFormReadyMailTemplate } from 'src/Templates/mail.OnFormReady';

export class Mailer extends EventEmitter2 {
  mailSender = (
    email: string,
    first_name: string,
    last_name: string,
    practice_name: string,
    event_name: string,
    link: any,
  ) => {

    let html: string = "";

    switch(event_name){
      default:
        html = mailTemplate(
          email,
          practice_name,
          event_name,
          first_name,
          last_name,
          link,
        );
  }
    const mailBody = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `${practice_name} - ${event_name}`,
      html: html,
    };
    this.emit('mail.send', mailBody);
  };

  mailSenderForOnReady = (
    email: string,
    first_name: string,
    last_name: string,
    practice_name: string,
    dueDate: string,
    link: any
  ) => {
    let html: string = "";

    html = onFormReadyMailTemplate(
      email, 
      practice_name, 
      first_name, 
      last_name, 
      dueDate, 
      link
    );

    const mailBody = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `${practice_name} - Reaccreditation`,
      html: html,
    };

    this.emit('mail.send', mailBody);
  };

  mailSenderForSupervisorRegistration = (
    reciverFirstName: string,
    reciverLastName: string,
    reciverEmail: string,
    senderFiestName: string,
    senderLastName: string,
    email: string,
    firstName: string,
    lastName: string,
    practiceName: string,
  ) => {
    const html = mailTemplateForSupervisorRegistor(
      reciverFirstName,
      reciverLastName,
      senderFiestName,
      senderLastName,
      email,
      firstName,
      lastName,
      practiceName,
    );
    const mailBody = {
      from: process.env.FROM_EMAIL,
      to: reciverEmail,
      subject: `New supervisor to be added`,
      html: html,
    };
    this.emit('mail.send', mailBody);
  };
}
