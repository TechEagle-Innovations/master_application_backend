import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BatteryDocument = Battery & Document;

@Schema({ timestamps: true })
export class Battery {
  @Prop({ required: true, unique: true })
  serialNumber: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  numberOfCells: number;

  @Prop({ required: true })
  voltage: number;

  @Prop({ required: true })
  capacityMah: number;

  @Prop({ required: true })
  locationId: string;

  @Prop({ default: null })
  currentFlightId: string | null;

  @Prop({ default: null })
  currentDroneId: string | null;

  @Prop({ default: 0 })
  flightsCount: number;

  @Prop({ default: 'idle' })
  status: 'idle' | 'charging' | 'discharging' | 'maintenance';

  @Prop({ default: 0 })
  chargingPercentage: number;
}

export const BatterySchema = SchemaFactory.createForClass(Battery);
