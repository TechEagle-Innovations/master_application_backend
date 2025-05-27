import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDesignationDocument = AdminDesignation & Document;

@Schema()
export class AdminDesignation {
  @Prop({ required: true, unique: true })
  designation: string;

  @Prop({ required: true })
  permissionLevel: number;

  @Prop({ type: Array })
  taskPermitted: any[];

  @Prop({ type: Array })
  availableTabs: any[];

  @Prop({ type: Array })
  availableModules: any[];
}

export const AdminDesignationSchema = SchemaFactory.createForClass(AdminDesignation);
