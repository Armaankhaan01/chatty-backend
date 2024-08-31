import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import Logger from 'bunyan';
import sendGridMail from '@sendgrid/mail';
import { config } from '@root/config';
import { BadRequestError } from '@globals/helpers/error-handler';

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const log: Logger = config.createLogger('mailOptions');

sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

class MailTransport {
  public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
      return this.developmentEmailSender(receiverEmail, subject, body);
    } else if (config.NODE_ENV === 'production') {
      return this.productionEmailSender(receiverEmail, subject, body);
    }
  }

  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const transporter: Mail = nodemailer.createTransport({
      host: '192.168.1.2',
      port: 10250,
      auth: {
        user: config.SENDER_EMAIL,
        pass: config.SENDER_EMAIL_PASSWORD
      }
    });

    const mailOptions: IMailOptions = {
      from: ` Chatty App <${config.SENDER_EMAIL}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      log.info('Message sent: %s', info.messageId);
    } catch (e) {
      log.error('Error sending email: %o', e);
      throw new BadRequestError('Error sending email');
    }
  }
  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const mailOptions: IMailOptions = {
      from: ` Chatty App <${config.SENDER_EMAIL}>`, // sender address : config.SENDER_EMAIL,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await sendGridMail.send(mailOptions);
      log.info('Production email sent Successfully %s');
    } catch (e) {
      log.error('Error sending email: %o', e);
      throw new BadRequestError('Error sending email');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
