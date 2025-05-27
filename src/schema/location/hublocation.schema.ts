import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HubLocationDocument = HubLocation & Document;

@Schema()
export class HubLocation {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop({ required: true })
  location_name: string;

  @Prop({ required: true })
  zone_id: string;

  @Prop({ required: true })
  country_id: string;

  @Prop({ required: true })
  state_id: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, unique: true })
  pin_code: number;

  @Prop({ required: true })
  tag_name: string;

  @Prop({ type: [Object], default: [] })
  employee: any[];

  @Prop({
    type: Object,
    default: {
      managerName: '',
      managerEmail: '',
      deployedBy: '',
      previousManager: '',
    },
  })
  manager: {
    managerName: string;
    managerEmail: string;
    deployedBy: string;
    previousManager: string;
  };

  @Prop({ type: [Object], default: [] })
  locationArray: any[];

  @Prop({
    type: Object,
    default: {
      inventory: 0,
      order: 0,
    },
  })
  all_summary: {
    inventory: number;
    order: number;
  };
}

export const HubLocationSchema = SchemaFactory.createForClass(HubLocation);
