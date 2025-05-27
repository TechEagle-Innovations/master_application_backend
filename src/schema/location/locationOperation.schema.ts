import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsDate, IsNumber, IsString, Matches } from 'class-validator';

@Schema({ _id: false, timestamps: true })
class WorkingHours {
  @Prop({
    required: true,
    default: '06:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid time format. Use HH:mm format.',
  })
  startTime: string;

  @Prop({
    required: true,
    default: '18:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid time format. Use HH:mm format.',
  })
  endTime: string;

  @Prop({
    required: true,
    default: 12 * 60, // 12 hours in minutes
  })
  @IsNumber()
  totalTime: number;
}

const WorkingHoursSchema = SchemaFactory.createForClass(WorkingHours);

@Schema({ timestamps: true })
export class LocationOperations extends Document {
  @Prop({ required: true })
  hubId: string;

  @Prop({ type: WorkingHoursSchema, default: {} })
  workingHours: WorkingHours;

  @Prop({ type: [Date], default: [] })
  @IsDate({ each: true })
  slots: Date[];

  @Prop({ default: 3 * 60 }) // 3 hours in minutes
  @IsNumber()
  roundTripTimeTaken: number;

  @Prop({ default: 0 }) // in minutes
  @IsNumber()
  cooldownTimePerTrip: number;

  @Prop({ default: 2 * 60 }) // 2 hours in minutes
  @IsNumber()
  dayReadinessTime: number;

  @Prop({ default: 1 })
  @IsNumber()
  earliestSlotAvailable: number;

  @Prop({ default: Date.now })
  @IsDate()
  earliestSlotDateAvailable: Date;
}

export const LocationOperationsSchema = SchemaFactory.createForClass(LocationOperations);