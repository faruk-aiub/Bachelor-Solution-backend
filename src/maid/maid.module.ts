import { Module } from '@nestjs/common';
import { MaidService } from './maid.service';
import { MaidController } from './maid.controller';

@Module({
  providers: [MaidService],
  controllers: [MaidController],
})
export class MaidModule {}
