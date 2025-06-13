import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Node extends Document {
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

  @Prop()
  roadDistance: string;

  @Prop()
  roadTime: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  pin_code: number;

  @Prop({ required: true })
  tag_name: string;

  @Prop({ type: [{ name: String, isActive: Boolean }], default: [] })
  logisticsTypeSupported: Array<{ name: string; isActive: boolean }>;

  @Prop({ default: 60 })
  maxFlightTime: number;

  @Prop()
  aerialDistance: number;

  @Prop({ default: 60 })
  aerialTime: number;

  @Prop({
    type: {
      QRLanding: Boolean,
      surfaceType: String,
      areaAvailable: Number,
      networkAvailability: {
        operations: [String],
        isAvailable: Boolean
      },
      storageFacilityTypeandCapacity: String,
      chargingFacilityTypes: String,
      electricityTimings: Number,
      shadesForPilots: Boolean,
      CG_Stand: {
        isRequired: Boolean,
        isAvailable: Boolean
      },
      compatibleDrones: [String],
      currentUseCases: [String],
      potentialUseCases: [String],
      nearestFacilities: {
        hospital: String,
        ATC: String,
        policeStation: String,
        fireBrigade: String,
        bloodBank: String
      }
    },
    default: {}
  })
  operationalDetails: {
    QRLanding?: boolean;
    surfaceType: string;
    areaAvailable?: number;
    networkAvailability?: {
      operations: string[];
      isAvailable: boolean;
    };
    storageFacilityTypeandCapacity: string;
    chargingFacilityTypes: string;
    electricityTimings?: number;
    shadesForPilots?: boolean;
    CG_Stand?: {
      isRequired: boolean;
      isAvailable: boolean;
    };
    compatibleDrones?: string[];
    currentUseCases?: string[];
    potentialUseCases?: string[];
    nearestFacilities?: {
      hospital?: string;
      ATC?: string;
      policeStation?: string;
      fireBrigade?: string;
      bloodBank?: string;
    };
  };
}

export const NodeSchema = SchemaFactory.createForClass(Node); 