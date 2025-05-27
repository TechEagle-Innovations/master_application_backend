import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MissionRouteDocument = MissionRoute & Document;

@Schema()
export class MissionRoute {
  @Prop({ required: true })
  mission_tagName: string;

  @Prop({ default: '' })
  mission_file: string;

  @Prop({ required: true })
  file_name: string;

  @Prop({ required: true })
  source_location: string;

  @Prop({ required: true })
  destination_location: string;

  @Prop({ required: true })
  hub: string;
}

export const MissionRouteSchema = SchemaFactory.createForClass(MissionRoute);
