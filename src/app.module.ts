import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { ServicesModule } from './services/services.module';
import { MessModule } from './mess/mess.module';
import { SupershopModule } from './supershop/supershop.module';
import { BookingsModule } from './bookings/bookings.module';
import { TransactionsModule } from './transactions/transactions.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { JobsModule } from './jobs/jobs.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HousingModule } from './housing/housing.module';
import { AdminModule } from './admin/admin.module';
import { SupportModule } from './support/support.module';
import { LearningModule } from './learning/learning.module';
import { AmbulanceModule } from './ambulance/ambulance.module';
import { MaidModule } from './maid/maid.module';
import { PlumberModule } from './plumber/plumber.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UploadsModule } from './uploads/uploads.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { FirebaseModule } from './firebase/firebase.module';
import { CronModule } from './cron/cron.module';
import { EventsModule } from './events/events.module';
@Module({
  imports: [
    // Rate Limiting Config (e.g. max 100 requests per 60 seconds per IP)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    // In-memory caching globally
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // default ttl 60 seconds
    }),
    // Background Jobs (Cron)
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProvidersModule,
    ServicesModule,
    MessModule,
    SupershopModule,
    BookingsModule,
    TransactionsModule,
    MarketplaceModule,
    JobsModule,
    ReviewsModule,
    NotificationsModule,
    HousingModule,
    AdminModule,
    SupportModule,
    LearningModule,
    AmbulanceModule,
    MaidModule,
    PlumberModule,
    UploadsModule,
    CronModule,
    EventsModule,
    FirebaseModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
