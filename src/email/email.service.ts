import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(to: string, code: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Your Verification Code',
      template: 'verification',
      context: {
        code,
      },
    });
  }
}
