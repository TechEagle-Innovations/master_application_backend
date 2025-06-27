import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Battery, BatteryDocument } from '../schema/battery.schema';

@Injectable()
export class BatteryService {
  constructor(
    @InjectModel(Battery.name) private batteryModel: Model<BatteryDocument>,
  ) {}

  /**
   * Create a new battery record.
   * @param data Required: serialNumber, model, numberOfCells, voltage, capacityMah, locationId
   */
  async create(data: Partial<Battery>): Promise<Battery> {
    // Basic validation
    const requiredFields = [
      'serialNumber',
      'model',
      'numberOfCells',
      'voltage',
      'capacityMah',
      'locationId',
    ];
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        throw new BadRequestException(`${field} is required`);
      }
    }
    const battery = await this.batteryModel.create(data);
    if (!battery) {
      throw new BadRequestException('Failed to create battery');
    }
    return battery;
  }

  async findAll(): Promise<Battery[]> {
    return this.batteryModel.find().exec();
  }

  async findOne(locationId: string): Promise<Battery[]> {
    // Fetch all batteries matching the given location
    const found = await this.batteryModel.find({ locationId }).exec();
    if (!found || found.length === 0) {
      throw new NotFoundException(`No batteries found for locationId ${locationId}`);
    }
    return found;
  }

  /**
   * Update battery details. Can update any of the battery fields.
   */
  async update(id: string, data: Partial<Battery>): Promise<Battery> {
    try {
      const battery = await this.batteryModel.findOne({ serialNumber: id }).exec();
      if (!battery) {
        throw new NotFoundException('Battery not found');
      }
      // only update locationId if provided
      if (data.locationId !== undefined) {
        battery.locationId = data.locationId;
      }

      return await battery.save();
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new BadRequestException(`Failed to update battery: ${err.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    const res = await this.batteryModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Battery not found');
  }

 async connect(
    serialNumber: string,
    flightId: string,
    droneId: string,
  ): Promise<Battery> {
    console.log(`Connecting battery ${serialNumber} to flight ${flightId} and drone ${droneId}`);
    try {
      const updated = await this.batteryModel.findOneAndUpdate(
        { serialNumber },
        { currentFlightId: flightId, currentDroneId: droneId, status: 'discharging' },
        { new: true },
      );
      if (!updated) {
        throw new NotFoundException(`Battery with serialNumber ${serialNumber} not found`);
      }
      return updated;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Failed to connect battery: ${err.message}`);
    }
  }
  async disconnect(serialNumber: string): Promise<Battery> {
    console.log(`disonnecting battery ${serialNumber} `);
    try {
      const updated = await this.batteryModel.findOneAndUpdate(
        { serialNumber },
        { 
          currentFlightId: null, 
          currentDroneId: null, 
          status: 'idle', 
          $inc: { flightsCount: 1 } 
        },
        { new: true },
      );
      if (!updated) {
        throw new NotFoundException(`Battery with serialNumber ${serialNumber} not found`);
      }
      return updated;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Failed to disconnect battery: ${err.message}`);
    }
  }

  async updateCharging(serialNumber: string, percentage: number): Promise<Battery> {
    if (percentage < 0 || percentage > 100) {
      throw new BadRequestException(
        'Charging percentage must be between 0 and 100',
      );
    }
    try {
      const updated = await this.batteryModel.findOneAndUpdate(
        { serialNumber },
        { 
          chargingPercentage: percentage, 
        },
        { new: true },
      );
      if (!updated) {
        throw new NotFoundException(`Battery with serialNumber ${serialNumber} not found`);
      }
      return updated;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Failed to update the charging of battery: ${err.message}`);
    }
  }
}
