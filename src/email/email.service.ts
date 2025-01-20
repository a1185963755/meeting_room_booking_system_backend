import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
@Injectable()
export class EmailService {
  private transporter: Transporter;
  private emailHost: string;
  private emailPort: number;
  private emailUser: string;
  private emailPass: string;

  constructor(private readonly configService: ConfigService) {
    this.emailHost = configService.get('email_host');
    this.emailPort = configService.get('email_port');
    this.emailUser = configService.get('email_user');
    this.emailPass = configService.get('email_pass');
    this.transporter = createTransport({
      host: this.emailHost,
      port: this.emailPort,
      secure: false,
      auth: {
        user: this.emailUser,
        pass: this.emailPass,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预定系统',
        address: this.emailUser,
      },
      to,
      subject,
      text,
    });
  }
}
