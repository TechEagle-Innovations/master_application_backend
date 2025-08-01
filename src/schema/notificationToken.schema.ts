import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationTokenDocument = NotificationToken & Document;

@Schema({ collection: 'push_tokens' })
export class NotificationToken {
  @Prop({ required: true, index: true }) 
  userId: string;

  @Prop({ required: true, unique: true, index: true }) 
  push_token: string;
}

export const NotificationTokenSchema = SchemaFactory.createForClass(NotificationToken);
