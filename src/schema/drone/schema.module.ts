// schemas/schemas.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Drone, DroneSchema } from './drone.schema';
import { DroneModel, DroneModelSchema } from './droneModel.schema';
import { DroneOrderSummary, DroneOrderSummarySchema } from './droneOrderSummary.schema';
import { DroneTestingSummary, DroneTestingSummarySchema } from './droneTestingSummary.schema';
import { DroneMaintenance, DroneMaintenanceSchema } from '../maintainance/droneMaintenance.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Drone.name, schema: DroneSchema }]),
        MongooseModule.forFeature([
            { name: DroneModel.name, schema: DroneModelSchema }
        ]),
        MongooseModule.forFeature([
            { name: DroneOrderSummary.name, schema: DroneOrderSummarySchema }
        ]),
        MongooseModule.forFeature([
            { name: DroneTestingSummary.name, schema: DroneTestingSummarySchema }
        ]),
        MongooseModule.forFeature([
            { name: DroneMaintenance.name, schema: DroneMaintenanceSchema }
        ])
    ],
    exports: [
        MongooseModule.forFeature([{ name: Drone.name, schema: DroneSchema }]),
        MongooseModule.forFeature([
            { name: DroneModel.name, schema: DroneModelSchema }
        ]),
        MongooseModule.forFeature([
            { name: DroneOrderSummary.name, schema: DroneOrderSummarySchema }
        ]),
        MongooseModule.forFeature([
            { name: DroneTestingSummary.name, schema: DroneTestingSummarySchema }
        ]),
        MongooseModule.forFeature([
            { name: DroneMaintenance.name, schema: DroneMaintenanceSchema }
        ])
    ],
})
export class DroneSchemaModule { }