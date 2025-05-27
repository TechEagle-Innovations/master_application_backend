// schemas/schemas.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Drone, DroneSchema } from './drone.schema';
import { DroneModel, DroneModelSchema } from './droneModel.schema';
import { DroneOrderSummary, DroneOrderSummarySchema } from './droneOrderSummary.schema';
import { DroneTestingSummary, DroneTestingSummarySchema } from './droneTestingSummary.schema';

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
        ])
    ],
})
export class DroneSchemaModule { }