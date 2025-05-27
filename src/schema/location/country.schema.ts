import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CountryDocument = Country & Document;

@Schema()
export class Country {
  @Prop({ required: true })
  country_name: string;

  @Prop({ type: Array, default: [] })
  zone_array: any[];

  @Prop({ type: Object, default: {} })
  manager: Record<string, any>;
}

export const CountrySchema = SchemaFactory.createForClass(Country);
