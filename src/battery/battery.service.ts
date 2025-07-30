import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Battery, BatteryDocument } from '../schema/battery.schema';
import { CreateBatteryDto, FlightHistoryDto } from './dto/create-battery.dto';
import { Request } from 'express';
import { throwException } from 'src/utility/throwError';

@Injectable()
export class BatteryService {
  constructor(
    @InjectModel(Battery.name) private batteryModel: Model<BatteryDocument>,
  ) {}

  /**
   * Create a new battery record.
   * @param data Required: serialNumber, model, numberOfCells, voltage, capacityMah, locationId
   */
  async create(data: CreateBatteryDto, req: Request) {
    const user = req.user as { location?: string; email?: string };
    //console.log('USER:', user);
    const mah = data.mah;
    const voltage = data.voltage;
    const batteryType = data.battery_type.toLowerCase();
    const type = batteryType === 'lipo' ? 'LP' : 'LI';
    const wh = (mah * voltage) / 1000;
    const whNonDecimal = Math.floor(wh);
  

    try {
      const count = await this.batteryModel.countDocuments();
      const batteryId = `BAT${type}${whNonDecimal}${count + 1}`;
      const currStatus = data.current_voltage >= 25 ? 'charged' : 'discharged';

      console.log('Battery ID:', batteryId);
      console.log('Current Status:', currStatus);

      //console.log('User from request:', user);
      if (!user || !user.location) {
        throw new InternalServerErrorException(
          'User location is not available in the request object.',
        );
      }
      if (!user.email) {
        throw new InternalServerErrorException(
          'User email is not available in the request object.',
        );
      }
      const location = user.location;
      const userID = user.email;

      const battery = new this.batteryModel({
        ...data,
        battery_id: batteryId,
        current_voltage: data.voltage,
        charged_status: currStatus,
        locationId: location,
        created_by: userID,
      });
      const createdBattery = await battery.save();
      if (!createdBattery) {
        throw new InternalServerErrorException('Failed to create battery');
      }
      return {
        status: 'success',
        message: 'Battery created successfully',
        data: createdBattery,
      };
    } catch (error) {
      console.error('Error inn adding battery to database:', error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }

  async findAll(): Promise<Battery[]> {
    return this.batteryModel.find().exec();
  }

  async findOne(locationId: string): Promise<Battery[]> {
    // Fetch all batteries matching the given location
    const found = await this.batteryModel.find({ locationId }).exec();
    if (!found || found.length === 0) {
      throw new NotFoundException(
        `No batteries found for locationId ${locationId}`,
      );
    }
    return found;
  }

  async connect( id: string, body: FlightHistoryDto, req: Request){
    const user = req.user as { email?: string, location?: string };
    if (!user) {
      throw new InternalServerErrorException(
        'User is not available in the request object.',
      );
    }
    const userID = user.email;
    const location = user.location;

    const battery = await this.batteryModel.find({ battery_id: id, locationId: location }).exec();
    if (!battery) {
      throw new NotFoundException(`Battery with ID ${id} not found at location ${location}`);
    }

    // battery.current_flight_id = body.flightId;
    // battery.flight_history.push({
    //   flightId: body.flightId,
    //   droneId: body.droneId,
    //   installed_by: userID,
    //   companion_id: body.companion_id,
    // });

    // return battery.save();
  } 
}
