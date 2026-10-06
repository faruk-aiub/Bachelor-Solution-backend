import { Module } from '@nestjs/common';
import { PlumberService } from './plumber.service';
import { PlumberController } from './plumber.controller';

@Module({
  providers: [PlumberService],
  controllers: [PlumberController],
})
export class PlumberModule {}
