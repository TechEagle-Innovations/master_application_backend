import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ZoneDocument = Zone & Document;

@Schema()
export class Zone {
  @Prop({ required: true })
  zone_name: string;

  @Prop({ required: true })
  country_id: string;

  @Prop({ type: Array, default: [] })
  states_array: any[];

  @Prop({ type: Object, default: {} })
  manager: Record<string, any>;
}

export const ZoneSchema = SchemaFactory.createForClass(Zone);
