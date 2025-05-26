import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FlightTestingDocument = FlightTestingInfo & Document;

@Schema()
export class FlightTestingInfo {
  @Prop({ required: true })
  drone_id: string;

  @Prop({ required: true })
  pilot_id: number;

  @Prop({ required: true })
  hub_id: number;
}

export const FlightTestingSchema = SchemaFactory.createForClass(FlightTestingInfo);