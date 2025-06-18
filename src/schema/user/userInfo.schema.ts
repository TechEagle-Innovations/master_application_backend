import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserDesignation } from '../../user/enums/user-designation.enum';

export type UserInfoDocument = UserInfo & Document;

@Schema()
export class UserInfo {
  @Prop({ required: true, unique: true })
  useremail: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  phone_no: string;

  @Prop({ default: '' })
  gender: string;

  @Prop({ type: Date, default: '' })
  date_birth: Date;

  @Prop({ required: true })
  userName: string;


  @Prop({ required: true })
  location: string;

  @Prop({ default: '' })
  delivery_location: string;

  @Prop({ default: 'Not Granted' })
  permission: string;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ default: 'incomplete' })
  verification: string;

  @Prop({ default: false })
  active: boolean;

  @Prop({ default: 'techeagle'})
  clientId: string;

  @Prop({default: undefined})
  resetPasswordToken?: string;

  @Prop({default: undefined})
  resetPasswordExpires?: Date;

  @Prop()
  refreshToken?: string;

  @Prop({ default: undefined })
  resetPasswordOtp?: string;

  @Prop({ default: undefined })
  resetPasswordOtpExpires?: Date;

  @Prop({ default: false })
  resetPasswordOtpVerified?: boolean;

  @Prop({ 
    type: String, 
    enum: UserDesignation,
    default: UserDesignation.CLIENT_USER 
  })
  designation: UserDesignation;
}

export const UserInfoSchema = SchemaFactory.createForClass(UserInfo);
