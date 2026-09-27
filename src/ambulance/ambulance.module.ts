import { Module } from '@nestjs/common';
import { AmbulanceService } from './ambulance.service';
import { AmbulanceController } from './ambulance.controller';

@Module({
  providers: [AmbulanceService],
  controllers: [AmbulanceController]
})
export class AmbulanceModule {}
