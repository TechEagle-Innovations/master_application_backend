import { Schema, Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FlightRecordDocument = FlightRecord & Document;
@Schema({ collection: 'flight_records', timestamps: true })
export class FlightRecord {
  @Prop({ required: true, unique: true, index: true })
  clearskyId: string;

  @Prop({ required: true })
  pilotEmail: string;

  @Prop({ required: true })
  droneId: string;

  @Prop({ required: true })
  preFlightAppUserId: string;

  @Prop({ default: null })
  postFlightAppUserId: string;

  @Prop(
    raw({
      type: Object,
    }),
  )
  flightData: Record<string, any>;

  @Prop(
    raw({
      type: Object,
    }),
  )
  preFlightChecklist: Record<number, any>;

  postFlightChecklist: Record<number, any>;

  @Prop({ type: [String], default: [] })
  preFlightImages: string[];

  @Prop({ type: [String], default: [] })
  postFlightImages: string[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const FlightRecordSchema = SchemaFactory.createForClass(FlightRecord);
