import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StateDocument = State & Document;

@Schema()
export class State {
  @Prop({ required: true })
  state_name: string;

  @Prop({ required: true })
  zone_id: string;

  @Prop({ type: Array, default: [] })
  location: any[];

  @Prop({ type: Object, default: {} })
  manager: Record<string, any>;
}

export const StateSchema = SchemaFactory.createForClass(State);
