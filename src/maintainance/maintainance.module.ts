import { Module } from '@nestjs/common';
import { MaintainanceController } from './maintainance.controller';
import { MaintainanceService } from './maintainance.service';
import { MaintainanceSchemaModule } from 'src/schema/maintainance/schema.module';
import { FleetModule } from 'src/fleet/fleet.module';
import { Drone } from 'src/drone/entities/drone.entity';
import { DroneModule } from 'src/drone/drone.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    MaintainanceSchemaModule,
    FleetModule,
    DroneModule
  ],
  controllers: [MaintainanceController],
  providers: [MaintainanceService],
  exports: [MaintainanceService],
})
export class MaintainanceModule {} 