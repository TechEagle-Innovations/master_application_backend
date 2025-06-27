import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BatteryController } from './battery.controller';
import { BatteryService } from './battery.service';
import { Battery, BatterySchema } from '../schema/battery.schema';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';
//import { UserModule } from 'src/user/user.module';

@Module({
  imports: [JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get('jwt.secret'),
          signOptions: {
            expiresIn: configService.get('jwt.expiresIn'),
          },
        }),
        inject: [ConfigService],
      }), MongooseModule.forFeature([{ name: Battery.name, schema: BatterySchema }])],
  controllers: [BatteryController],
  providers: [BatteryService, JwtAuthGuard],
})
export class BatteryModule {}
