import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false, timestamps: true })
class LogisticsTypeSupported {
  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  isActive: boolean;
}

const LogisticsTypeSupportedSchema = SchemaFactory.createForClass(LogisticsTypeSupported);

@Schema({ _id: false, timestamps: true })
class Facilities {
  @Prop({ default: null })
  hospital: string;

  @Prop({ default: null })
  ATC: string;

  @Prop({ default: null })
  policeStation: string;

  @Prop({ default: null })
  fireBrigade: string;

  @Prop({ default: null })
  bloodBank: string;
}

const FacilitiesSchema = SchemaFactory.createForClass(Facilities);

@Schema({ _id: false, timestamps: true })
class NetworkAvailability {
  @Prop({ type: [String], default: [] })
  operations: string[];

  @Prop({ default: false })
  isAvailable: boolean;
}

const NetworkAvailabilitySchema = SchemaFactory.createForClass(NetworkAvailability);

@Schema({ _id: false, timestamps: true })
class CGStand {
  @Prop({ default: false })
  isRequired: boolean;

  @Prop({ default: false })
  isAvailable: boolean;
}

const CGStandSchema = SchemaFactory.createForClass(CGStand);

@Schema({ _id: false, timestamps: true })
class LocationOperationalDetails {
  @Prop({ default: false })
  QRLanding: boolean;

  @Prop({ required: true })
  surfaceType: string;

  @Prop({ default: null })
  areaAvailable: number;

  @Prop({ type: NetworkAvailabilitySchema, default: {} })
  networkAvailability: NetworkAvailability;

  @Prop({ required: true, default: null })
  storageFacilityTypeandCapacity: string;

  @Prop({ required: true, default: null })
  chargingFacilityTypes: string;

  @Prop({ default: null })
  electricityTimings: number;

  @Prop({ default: false })
  shadesForPilots: boolean;

  @Prop({ type: CGStandSchema, default: {} })
  CG_Stand: CGStand;

  @Prop({ type: [String], default: [] })
  compatibleDrones: string[];

  @Prop({ type: [String], default: [] })
  currentUseCases: string[];

  @Prop({ type: [String], default: [] })
  potentialUseCases: string[];

  @Prop({ type: FacilitiesSchema, default: {} })
  nearestFacilities: Facilities;
}

const LocationOperationalDetailsSchema = SchemaFactory.createForClass(LocationOperationalDetails);

@Schema({ timestamps: true })
export class LocationInfo extends Document {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  location_name: string;

  @Prop({ required: true })
  country_id: string;

  @Prop({ required: true })
  zone_id: string;

  @Prop({ required: true })
  state_id: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  relatedHubs: string;

  @Prop({ default: null })
  roadDistance: string;

  @Prop({ default: null })
  roadTime: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  pin_code: number;

  @Prop({ required: true })
  tag_name: string;

  @Prop({
    type: [LogisticsTypeSupportedSchema],
    default: [
      { name: 'Forward', isActive: false },
      { name: 'Reverse', isActive: false },
    ],
  })
  logisticsTypeSupported: LogisticsTypeSupported[];

  @Prop({ default: 60 }) // in minutes
  maxFlightTime: number;

  @Prop({ default: null }) // in Km
  aerialDistance: number;

  @Prop({ default: 60 }) // in minutes
  aerialTime: number;

  @Prop({ type: LocationOperationalDetailsSchema, default: {} })
  operationalDetails: LocationOperationalDetails;
}

export const LocationInfoSchema = SchemaFactory.createForClass(LocationInfo);