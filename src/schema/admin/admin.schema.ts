import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema()
export class Admin {
  @Prop({ required: true, unique: true })
  useremail: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  designation: string;

  @Prop({ required: true })
  phone_no: string;

  @Prop({ default: '' })
  country: string;

  @Prop({ default: '' })
  zone: string;

  @Prop({ default: '' })
  state: string;

  @Prop({ default: '63bd5b3ccafee0c35772f8f1' })
  location: string;

  @Prop({ required: true })
  location_type: string;

  @Prop({ default: '' })
  authorized_location: string;

  @Prop({ default: '' })
  authorized_location_type: string;

  @Prop({ default: 10 })
  permissionLevel: number;

  @Prop({ default: 'incomplete' })
  verification: string;

  @Prop({ required: true })
  addedBy: string;

  @Prop({ default: '' })
  deployedBy: string;

  @Prop({ default: false })
  active: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
