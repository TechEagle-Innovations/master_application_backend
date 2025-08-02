// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UserModule } from './user/user.module';
import { BatteryModule } from './battery/battery.module';
import { NodeModule } from './node/node.module';
import { DroneModule } from './drone/drone.module';
import { FleetModule } from './fleet/fleet.module';
import { MaintainanceModule } from './maintainance/maintainance.module';
import { NotificationModule } from './notification/notification.module';
import { ClearSkyModule } from './clearsky/clearsky.module';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGO_URI');
        if (!uri) {
          throw new Error('MONGO_URI is not defined in environment');
        }
        return { uri, retryAttempts: 5, retryDelay: 1000 };
      },
      inject: [ConfigService],
    }),
    UserModule,
    BatteryModule,
    NodeModule,
    DroneModule,
    FleetModule,
    MaintainanceModule,
    NotificationModule,
    ClearSkyModule
  ],
  controllers: [AppController],
  providers: [
    AppService   
  ],
})
export class AppModule {}
