import { Module } from '@nestjs/common';
import { MessService } from './mess.service';
import { MessController } from './mess.controller';

@Module({
  providers: [MessService],
  controllers: [MessController],
})
export class MessModule {}
