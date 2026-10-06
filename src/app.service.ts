import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppStatus() {
    return {
      name: 'Bachelor Solution API',
      version: '1.0.0',
      status: '🚀 Running perfectly!',
      docs: '/api-docs',
    };
  }
}
