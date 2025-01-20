import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
@Injectable()
export class EmailService {
  private transporter: Transporter;
  constructor() {
    this.transporter = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: '1185963755@qq.com',
        pass: 'aykpljubulhvfide',
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预定系统',
        address: '1185963755@qq.com',
      },
      to,
      subject,
      text,
    });
  }
}
