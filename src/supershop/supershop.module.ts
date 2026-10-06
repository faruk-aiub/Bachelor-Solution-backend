import { Module } from '@nestjs/common';
import { SupershopService } from './supershop.service';
import { SupershopController } from './supershop.controller';

@Module({
  providers: [SupershopService],
  controllers: [SupershopController],
})
export class SupershopModule {}
