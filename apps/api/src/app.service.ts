import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private config: ConfigService) {}
  getHello(): string {
    const port = this.config.get<number>('PORT');
    return `The API runs good on port ${port}`;
  }
}
