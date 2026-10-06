import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'bachelor_solution_secret',
    }),
  ],
  providers: [EventsGateway],
  exports: [EventsGateway], // Export it so other modules (like notifications) can use it
})
export class EventsModule {}
