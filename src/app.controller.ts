import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Payload } from '@nestjs/microservices';
import { mailSender } from './Listeners/mail.listener';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Get('callback')
  callback(): string {
    return 'callback';
  }
  @Post()
  async sendEmail(@Payload() data: any): Promise<void> {
    // console.log(data);
    mailSender(
      data.email,
      data.first_name,
      data.last_name,
      data.practice_name,
      data.event_name,
      data.link,
    );
  }
}
