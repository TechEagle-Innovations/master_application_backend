import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FlightDocument = FlightInfo & Document;

@Schema({ timestamps: true })
export class FlightInfo {
  @Prop({ required: true })
  drone_id: string;

  @Prop()
  localFlightId: string;

  @Prop({ required: true })
  pilot_id1: string;

  @Prop({ required: true })
  pilot_id2: string;

  @Prop()
  order_manager: string;

  @Prop({ required: true })
  order_destination_location: string;

  @Prop({ required: true })
  hub_id: string;

  @Prop({ required: true })
  date_created: Date;

  @Prop({ default: '' })
  mission_file: string;

  @Prop({
    type: new MongooseSchema({
      takeoffAMSL: { type: String, default: null },
      landingAMSL: { type: String, default: null },
      maxAMSL: { type: String, default: null },
      minAMSL: { type: String, default: null },
      AMSLdifference: { type: String, default: null },
      missionFileLink: { type: String, default: null },
      roadDistance: { type: String, default: null },
      roadTime: { type: String, default: null },
    }, { _id: false, timestamps: true })
  })
  mission_details: Record<string, any>;

  @Prop()
  start_time: Date;

  @Prop()
  end_time: Date;

  @Prop({ default: 0 })
  time_taken: number;

  @Prop()
  start_location: string;

  @Prop()
  end_location: string;

  @Prop()
  distance_coverved: number;

  @Prop()
  payload: number;

  @Prop({ type: MongooseSchema.Types.Mixed })
  payloadDetails: any[] | string;

  @Prop({ default: null })
  uploadMissionFile: string;

  @Prop({ required: true })
  flight_type: string;

  @Prop({ default: '0' })
  order_no: string;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ default: false })
  isAborted: boolean;

  @Prop({
    type: {
      status: { type: Boolean, default: false },
      reason: { type: String, default: null }
    },
    default: { status: false, reason: null }
  })
  finalStatus: Record<string, any>;

  @Prop({ default: 'clearSky' })
  flightDoneUsing: string;

  @Prop({
    type: {
      isFlightLogAdded: { type: Boolean, default: false },
      logFileName: { type: String, default: null },
      date: { type: Date, default: null }
    },
    default: { isFlightLogAdded: false, logFileName: null, date: null }
  })
  flightLog: Record<string, any>;

  @Prop({ default: false })
  isPreFlightChecklistCompleted: boolean;

  @Prop({ default: false })
  isPostFlightChecklistCompleted: boolean;

  @Prop({ type: Array, default: [] })
  preFlightChecklist: any[];

  @Prop({ type: Array, default: [] })
  postFlightChecklist: any[];

  @Prop({
    type: new MongooseSchema({
      created: { type: Date, default: null },
      assignedToDrone: { type: Date, default: null },
      started: { type: Date, default: null },
      preCheck: { type: Date, default: null },
      missionStarted: { type: Date, default: null },
      missionCompleted: { type: Date, default: null },
      postCheck: { type: Date, default: null },
      payloadRemoved: { type: Date, default: null },
      flightLogUploaded: { type: Date, default: null },
      aborted: { type: Date, default: null },
    }, { _id: false, timestamps: true })
  })
  flightStatus: Record<string, any>;

  @Prop({
    type: new MongooseSchema({
      date: { type: Date, required: true },
      slot: { type: Number, required: true },
    }, { _id: false, timestamps: true }),
    required: true
  })
  scheduleDetails: Record<string, any>;

  @Prop({
    type: [new MongooseSchema({
      date: { type: Date, required: true },
      slot: { type: Number, required: true },
    }, { _id: false, timestamps: true })],
    required: true
  })
  scheduleLog: Record<string, any>[];
}

export const FlightSchema = SchemaFactory.createForClass(FlightInfo);