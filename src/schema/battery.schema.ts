import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BatteryDocument = Battery & Document;

@Schema({ _id: false })
class ChargeHistory {
  @Prop() charge_start_time: Date;
  @Prop() charge_end_time: Date;
  @Prop() charging_hours: number;

  @Prop({ type: Map, of: Number })
  cell_voltage: Record<string, number>;

  @Prop() maxVdiff: number;
  @Prop() voltage_before_charge: number;
  @Prop() voltage_after_charge: number;
  @Prop() remark: string;
  @Prop() monitor_by: string;
}

@Schema({ _id: false })
class FlightHistory {
  @Prop() flightId: string;
  @Prop() droneId: string;
  @Prop() installed_by: string;
  @Prop() all_Battery: string[];
}

@Schema({ timestamps: true })
export class Battery {
  @Prop({ required: true }) model: string;
  @Prop({ required: true }) num_of_cells: number;
  @Prop({ required: true }) voltage: number;
  @Prop({ required: true }) current_voltage: number;
  @Prop({ required: true }) mah: number;
  @Prop({ required: true, unique: true }) battery_id: string;
  @Prop({ required: true, enum: ['lipo', 'li-ion'] }) battery_type: string;
  @Prop() image: string;
  @Prop({ enum: ['charged', 'discharged', 'charging', 'active', 'dicarded'] })
  charged_status: string;

  @Prop() locationId: string;
  @Prop() hubId: string;
  @Prop() current_flight_id: string;
  @Prop() created_by: string;
  @Prop({default: 0}) cycle_count: number;

  @Prop({ type: [ChargeHistory] }) history: ChargeHistory[];
  @Prop({ type: [FlightHistory] }) flight_history: FlightHistory[];

  @Prop() curr_max_vdiff: number;
}

export const BatterySchema = SchemaFactory.createForClass(Battery);
