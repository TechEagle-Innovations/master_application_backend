// schemas/schemas.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlightInfo, FlightSchema } from './flight.schema';
import { FlightTestingInfo, FlightTestingSchema } from './flightTesting.schema';
import { FlightInfoRpiCache, FlightInfoRpiCacheSchema } from './flightTimeStamp.schema';
import { MissionRoute, MissionRouteSchema } from './mission.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: FlightInfo.name, schema: FlightSchema }]),
        MongooseModule.forFeature([{ name: MissionRoute.name, schema: MissionRouteSchema }]),
        MongooseModule.forFeature([{ name: FlightTestingInfo.name, schema: FlightTestingSchema }]),
        MongooseModule.forFeature([{ name: FlightInfoRpiCache.name, schema: FlightInfoRpiCacheSchema }])
    ],
    exports: [
        MongooseModule.forFeature([{ name: FlightTestingInfo.name, schema: FlightTestingSchema }]),
        MongooseModule.forFeature([{ name: MissionRoute.name, schema: MissionRouteSchema }]),
        MongooseModule.forFeature([{ name: FlightInfo.name, schema: FlightSchema }]),
        MongooseModule.forFeature([{ name: FlightInfoRpiCache.name, schema: FlightInfoRpiCacheSchema }])
    ],
})
export class FleetSchemaModule { }