import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FleetModule } from './fleet/fleet.module';
import { UserModule } from './user/user.module';
import { BatteryModule } from './battery/battery.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env"
    }),
    // MongooseModule.forRoot("mongodb://localhost/testLocation"),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        retryAttempts: 5,
        retryDelay: 1000,
      }),
      inject:[ConfigService]
    }),
    FleetModule,
    UserModule,
    BatteryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
