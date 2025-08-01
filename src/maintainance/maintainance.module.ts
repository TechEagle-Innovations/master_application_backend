import { Module } from '@nestjs/common';
import { MaintainanceController } from './maintainance.controller';
import { MaintainanceService } from './maintainance.service';
import { MaintainanceSchemaModule } from 'src/schema/maintainance/schema.module';
import { FleetModule } from 'src/fleet/fleet.module';
import { Drone } from 'src/drone/entities/drone.entity';
import { DroneModule } from 'src/drone/drone.module';

@Module({
  imports: [
    MaintainanceSchemaModule,
    FleetModule,
    DroneModule
  ],
  controllers: [MaintainanceController],
  providers: [MaintainanceService],
  exports: [MaintainanceService],
})
export class MaintainanceModule {} 