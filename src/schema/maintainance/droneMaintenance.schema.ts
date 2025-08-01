import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DroneMaintenanceDocument = DroneMaintenance & Document;

@Schema()
export class MaintenanceAction {
  @Prop({ required: true })
  action: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  performedBy: Types.ObjectId;

  @Prop()
  performedAt: Date;

  @Prop()
  notes: string;
}

@Schema()
export class MaintenanceChecklistItem {
  @Prop({ required: true })
  item: string;

  @Prop({ default: false })
  checked: boolean;

  @Prop()
  checkedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  checkedBy: Types.ObjectId;
}

@Schema()
export class DroneMaintenance {
  @Prop({ type: Types.ObjectId, ref: 'Drone', required: true })
  droneId: Types.ObjectId;

  @Prop({ required: true, enum: ['REGULAR', 'ISSUE_REPORTED'] })
  maintenanceType: string;

  @Prop({ required: true, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'PENDING' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop() // For regular maintenance
  scheduledDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' }) // For issue reporting
  reportedBy: Types.ObjectId;

  @Prop()
  description: string;

  @Prop({ type: [MaintenanceAction], default: [] })
  actionsTaken: MaintenanceAction[];

  @Prop()
  resolvedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo: Types.ObjectId;

  @Prop({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' })
  priority: string;

  // Regular maintenance fields
  @Prop({ type: [MaintenanceChecklistItem], default: [] })
  maintenanceChecklist: MaintenanceChecklistItem[];

  @Prop()
  nextScheduledDate: Date;

  @Prop()
  maintenanceInterval: string;

  // Issue reporting fields
  @Prop({ enum: ['HARDWARE', 'SOFTWARE', 'OTHER'] })
  issueType: string;

  @Prop({ enum: ['MINOR', 'MAJOR', 'CRITICAL'] })
  issueSeverity: string;

  @Prop()
  userComments: string;

  @Prop({ type: Object, default: {} })
  images:{};

  @Prop({ default: false })
  isResolved: boolean;
}

export const DroneMaintenanceSchema = SchemaFactory.createForClass(DroneMaintenance);
