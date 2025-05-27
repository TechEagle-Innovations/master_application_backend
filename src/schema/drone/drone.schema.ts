import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DroneDocument = Drone & Document;

class FlightHours {
  @Prop({ default: 0 })
  hours: number;

  @Prop({ default: 0 })
  minutes: number;

  @Prop({ default: 0 })
  seconds: number;
}

@Schema()
export class Drone {
  @Prop({ required: true })
  internal_id: string;

  @Prop({ required: true })
  model_no: string;

  @Prop({ required: true })
  drone_password: string;

  @Prop()
  drone_gov_id: string;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  payload_capacity: number;

  @Prop({ required: true })
  max_range: number;

  @Prop({ type: FlightHours, _id: false })
  flight_hours: FlightHours;

  @Prop({ required: true })
  length: number;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop()
  last_maintenance_date: Date;

  @Prop({ required: true })
  manufacturing_date: Date;

  @Prop({ default: 'Testing' })
  drone_phase: string;

  @Prop({ required: true, min: 10, max: 99 })
  drone_version: number;

  @Prop({ default: 'unassigned' })
  pilot_id1: string;

  @Prop({ default: 'unassigned' })
  pilot_id2: string;

  @Prop({ default: '63bd5b3ccafee0c35772f8f1' })
  hub_location: string;

  @Prop({ default: '63bd5b3ccafee0c35772f8f1' })
  current_location: string;

  @Prop({ default: '' })
  current_flight_id: string;
}

export const DroneSchema = SchemaFactory.createForClass(Drone);