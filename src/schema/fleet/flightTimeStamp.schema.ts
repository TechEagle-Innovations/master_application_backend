import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FlightInfoRpiCacheDocument = FlightInfoRpiCache & Document;

@Schema({ timestamps: true })
export class FlightInfoRpiCache {
  @Prop({ 
    type: String,
    required: true,
    unique: true
  })
  flightId: string;

  @Prop({
    type: Object,
    required: true
  })
  dataCache: Record<string, any>;
}

export const FlightInfoRpiCacheSchema = SchemaFactory.createForClass(FlightInfoRpiCache);