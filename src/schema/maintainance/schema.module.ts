// schemas/schemas.module.ts
import { Module } from '@nestjs/common';
import { DroneMaintenance, DroneMaintenanceSchema } from './droneMaintenance.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DroneImagesAI, DroneImagesAISchema } from './droneImagesai.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DroneMaintenance.name, schema: DroneMaintenanceSchema },
            { name: DroneImagesAI.name, schema: DroneImagesAISchema }
        ])
    ],
    exports: [
        MongooseModule.forFeature([
            { name: DroneMaintenance.name, schema: DroneMaintenanceSchema },
            { name: DroneImagesAI.name, schema: DroneImagesAISchema }
        ])
    ],
})
export class MaintainanceSchemaModule { }