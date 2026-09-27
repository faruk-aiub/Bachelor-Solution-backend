import { Module } from '@nestjs/common';
import { HousingService } from './housing.service';
import { HousingController } from './housing.controller';

@Module({
  providers: [HousingService],
  controllers: [HousingController]
})
export class HousingModule {}
