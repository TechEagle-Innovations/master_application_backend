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
    const user = req.user as {
      location?: string;
      email?: string;
      curLocation?: string;
    };
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
      const curLocation = user.curLocation;

      const battery = new this.batteryModel({
        ...data,
        battery_id: batteryId,
        current_voltage: data.voltage,
        charged_status: currStatus,
        locationId: curLocation,
        hubId: location,
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

  async connect(body: FlightHistoryDto, req: Request) {
    const user = req.user as {
      email?: string;
      location?: string;
      curLocation?: string;
    };
    if (!user) {
      throw new InternalServerErrorException(
        'User is not available in the request object.',
      );
    }
    //get user email, hub location and cuurent location from the request
    const userID = user.email;
    const hublocation = user.location;
    const curLocation = user.curLocation;
    //get the battery ids from the body
    const batteryIdArray = body.all_Battery;
    const numberOfBatteries = batteryIdArray.length;
    if (
      !batteryIdArray ||
      !Array.isArray(batteryIdArray) ||
      numberOfBatteries === 0
    ) {
      throw new BadRequestException('Invalid or missing battery IDs');
    }
    try {
      for (const batteryId of batteryIdArray) {
        // Check if the battery exists
        const battery = await this.batteryModel
          .findOne({ battery_id: batteryId, locationId: curLocation })
          .exec();
        if (!battery) {
          throw new NotFoundException(
            `Battery with ID ${batteryId} not found at location ${curLocation}`,
          );
        }
        if (battery.charged_status !== 'charged') {
          throw new BadRequestException(
            `Battery with ID ${batteryId} is not charged`,
          );
        }
        if (battery.current_voltage < 23) {
          throw new BadRequestException(
            `Battery with ID ${batteryId} has low voltage`,
          );
        }
        if (battery.curr_max_vdiff > 1) {
          throw new BadRequestException(
            `Battery with ID ${batteryId} has high voltage difference`,
          );
        }
        // Update the battery's current flight ID, charged status and flight history
        battery.current_flight_id = body.flightId;
        battery.charged_status = 'active';
        battery.flight_history.push({
          flightId: body.flightId,
          droneId: body.droneId,
          installed_by: userID,
          all_Battery: batteryIdArray,
        });
        // Save the updated battery
        const updatedBattery = await battery.save();
        if (!updatedBattery) {
          throw new InternalServerErrorException(
            `Failed to update battery with ID ${batteryId}`,
          );
        }
        console.log(`Battery with ID ${batteryId} connected successfully`);
      }
    } catch (error) {
      console.error(`Error connecting battery :`, error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }
  
}
