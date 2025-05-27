// schemas/schemas.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationInfo, LocationInfoSchema } from './locationInfo.schema';
import { HubLocation, HubLocationSchema } from './hublocation.schema';
import { LocationOperations, LocationOperationsSchema } from './locationOperation.schema';
import { Zone, ZoneSchema } from './zone.schema';
import { State, StateSchema } from './state.schema';
import { Country, CountrySchema } from './country.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: LocationInfo.name, schema: LocationInfoSchema }]),
        MongooseModule.forFeature([{ name: Zone.name, schema: ZoneSchema }]),
        MongooseModule.forFeature([{ name: State.name, schema: StateSchema }]),
        MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
        MongooseModule.forFeature([{ name: HubLocation.name, schema: HubLocationSchema }]),
        MongooseModule.forFeature([{ name: LocationOperations.name, schema: LocationOperationsSchema }])
    ],
    exports: [
        MongooseModule.forFeature([{ name: LocationInfo.name, schema: LocationInfoSchema }]),
        MongooseModule.forFeature([{ name: Zone.name, schema: ZoneSchema }]),
        MongooseModule.forFeature([{ name: State.name, schema: StateSchema }]),
        MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }]),
        MongooseModule.forFeature([{ name: HubLocation.name, schema: HubLocationSchema }]),
        MongooseModule.forFeature([{ name: LocationOperations.name, schema: LocationOperationsSchema }])
    ],
})
export class LocationSchemaModule { }