import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false }) // Embedded schema without _id
export class FlightHours {
  @Prop({ default: 0 })
  hours: number;

  @Prop({ default: 0 })
  minutes: number;

  @Prop({ default: 0 })
  seconds: number;
}

export type DroneTestingSummaryDocument = DroneTestingSummary & Document;

@Schema()
export class DroneTestingSummary {
  @Prop({ required: true, unique: true })
  drone_id: string;

  @Prop()
  drone_gov_id: string;

  @Prop({ required: true })
  model_no: string;

  @Prop()
  initializing_date: Date;

  @Prop({ default: 0 })
  flights_completed: number;

  @Prop({ default: 0 })
  flight_aborted: number;

  @Prop({ default: 0 })
  total_payload: number;

  @Prop()
  last_maintnance_date: Date;

  @Prop({ type: () => FlightHours, _id: false, default: () => ({}) })
  flight_hours: FlightHours;
}

export const DroneTestingSummarySchema = SchemaFactory.createForClass(DroneTestingSummary);
