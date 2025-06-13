import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FleetModule } from './fleet/fleet.module';
<<<<<<< HEAD
import { UserModule } from './user/user.module';
=======
import { BatteryModule } from './battery/battery.module';
>>>>>>> d0a559ea4559c800766f2adbf81797a1818b69db

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
<<<<<<< HEAD
    UserModule,
=======
    BatteryModule,
>>>>>>> d0a559ea4559c800766f2adbf81797a1818b69db
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
