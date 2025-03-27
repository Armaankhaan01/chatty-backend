import fs from 'fs';
import ejs from 'ejs';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';

class NotificationTemplate {
  public notificationMessageTemplate(templateParams: INotificationTemplate): string {
    const { username, header, message } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/notification-template.ejs', 'utf8'), {
      username,
      header,
      message,
      image_url: 'https://res.cloudinary.com/dpey3zzge/image/upload/v1740986497/nyj5ju4zc7bthhtacixl.png'
    });
  }
}

export const notificationTemplate: NotificationTemplate = new NotificationTemplate();
