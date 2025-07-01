// schemas/schemas.module.ts
import { Module } from '@nestjs/common';
import { DroneMaintenance, DroneMaintenanceSchema } from './droneMaintenance.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DroneMaintenance.name, schema: DroneMaintenanceSchema }
        ])
    ],
    exports: [
        MongooseModule.forFeature([
            { name: DroneMaintenance.name, schema: DroneMaintenanceSchema }
        ])
    ],
})
export class MaintainanceSchemaModule {}