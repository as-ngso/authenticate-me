import { randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
  generateRandomToken() {
    return new Promise<string>((resolve, reject) => {
      randomBytes(48, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          const token = buf.toString('base64');
          resolve(token);
        }
      });
    });
  }
}
