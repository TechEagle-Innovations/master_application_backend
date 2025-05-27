import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema()
export class Employee {
  @Prop({ required: true, unique: true })
  useremail: string;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  designation: string;

  @Prop({ required: true })
  phone_no: string;

  @Prop()
  location: string;

  @Prop()
  zone: string;

  @Prop()
  state: string;

  @Prop()
  country: string;

  @Prop({ type: Number, default: 10 })
  permissionLevel: number;

  @Prop({ required: true })
  addedBy: string;

  @Prop({ default: '' })
  deployedBy: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
