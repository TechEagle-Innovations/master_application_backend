import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DroneModelDocument = DroneModel & Document;

@Schema()
export class DroneModel {
  @Prop({ required: true })
  full_model_name: string;

  @Prop({ required: true, minlength: 1, maxlength: 1 })
  drone_type: string;

  @Prop({ minlength: 1, maxlength: 1 })
  vertical_propulsion_type: string;

  @Prop({ minlength: 1, maxlength: 1 })
  forward_propulsion: string;

  @Prop({ required: true, min: 1000, max: 9999 }) // Changed from min/max_length to min/max for numbers
  payload_capacity: number;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  length: number;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  max_range: number;

  @Prop({ required: true, min: 10, max: 99 }) // Changed from min/max_length to min/max for numbers
  version: number;

  @Prop({ required: true, minlength: 5, maxlength: 5 })
  short_name: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: 0 })
  noOfDrones: number;
}

export const DroneModelSchema = SchemaFactory.createForClass(DroneModel);