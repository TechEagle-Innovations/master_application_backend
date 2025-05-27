import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserImageDataDocument = UserImageData & Document;

@Schema()
export class UserImageData {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  imagedata: string;
}

export const UserImageDataSchema = SchemaFactory.createForClass(UserImageData);
