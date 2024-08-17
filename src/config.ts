import dotenv from 'dotenv';
import bunyan from 'bunyan';

dotenv.config({});

class Config {
  public DATABASE_URL: string | undefined = process.env.DATABASE_URL;
  public JWT_TOKEN: string | undefined = process.env.JWT_TOKEN;
  public NODE_ENV: string | undefined = process.env.NODE_ENV;
  public SECRET_KEY_ONE: string | undefined = process.env.SECRET_KEY_ONE;
  public SECRET_KEY_TWO: string | undefined = process.env.SECRET_KEY_TWO;
  public CLIENT_URL: string | undefined = process.env.CLIENT_URL;
  public REDIS_HOST: string | undefined = process.env.REDIS_HOST;

  private readonly DEFAULT_DATABASE_URL: string =
    'mongodb://192.168.1.4:27017/chattyapp-backend';
  constructor() {
    this.DATABASE_URL = this.DATABASE_URL || this.DEFAULT_DATABASE_URL;
  }
  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: 'debug' });
  }
  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined.`);
      }
    }
  }
}

export const config: Config = new Config();
