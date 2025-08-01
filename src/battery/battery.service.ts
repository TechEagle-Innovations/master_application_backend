import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Battery, BatteryDocument } from '../schema/battery.schema';
import {
  ChargeHistoryDto,
  CreateBatteryDto,
  DisconnectBatteryDto,
  FlightHistoryDto,
} from './dto/create-battery.dto';
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
    const batteryIdArray = body.all_battery;
    const numberOfBatteries = batteryIdArray.length;
    if (
      !batteryIdArray ||
      !Array.isArray(batteryIdArray) ||
      numberOfBatteries === 0
    ) {
      throw new BadRequestException('Invalid or missing battery IDs');
    }
    try {
      let fetchBatteries: BatteryDocument[] = [];

      // Fetch all batteries with the given battery IDs
      for (const batteryId of batteryIdArray) {
        const battery = await this.batteryModel.findOne({
          battery_id: batteryId,
        });
        if (!battery) {
          throw new NotFoundException(`Battery with ID ${batteryId} not found`);
        }
        fetchBatteries.push(battery);
      }
      // Validate each battery's status and voltage
      for (const battery of fetchBatteries) {
        if (battery.charged_status !== 'charged') {
          throw new BadRequestException(
            `Battery with ID ${battery.battery_id} is either not charged, currently charging, currently active in drone or has been discarded`,
          );
        }
        if (battery.current_voltage < 23) {
          throw new BadRequestException(
            `Battery with ID ${battery.battery_id} has low voltage`,
          );
        }
        if (battery.curr_max_vdiff > 1) {
          throw new BadRequestException(
            `Battery with ID ${battery.battery_id} has high voltage difference`,
          );
        }
        // save the battery updates
        for (const battery of fetchBatteries) {
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
              `Failed to update battery with ID ${battery.battery_id}`,
            );
          }
          console.log(
            `Battery with ID ${battery.battery_id} connected successfully`,
          );
        }
        return {
          status: 'success',
          message: `${numberOfBatteries} batteries connected successfully`,
          data: batteryIdArray.map((id) => ({ battery_id: id })),
        };
      }
    } catch (error) {
      console.error(`Error connecting battery :`, error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }

  async disconnect(body: DisconnectBatteryDto, req: Request) {
    try {
      // fetch the batteries from the database
      const batteryIdArray = body.all_Battery;
      if (
        !batteryIdArray ||
        !Array.isArray(batteryIdArray) ||
        batteryIdArray.length === 0
      ) {
        throw new BadRequestException('Invalid or missing battery IDs');
      }
      const fetchBatteries: BatteryDocument[] = [];
      for (const batteryId of batteryIdArray) {
        const battery = await this.batteryModel.findOne({
          battery_id: batteryId,
        });
        if (!battery) {
          throw new NotFoundException(`Battery with ID ${batteryId} not found`);
        }
        fetchBatteries.push(battery);
      }
      // check for same current flight id
      const currentFlightId = fetchBatteries[0].current_flight_id;
      // if (!currentFlightId) {
      //   throw new BadRequestException('No current flight ID found for the batteries');
      // }
      for (const battery of fetchBatteries) {
        if (battery.current_flight_id !== currentFlightId) {
          throw new BadRequestException(
            `Battery with ID ${battery.battery_id} is not connected to the same flight`,
          );
        }
      }

      // iterate throught the battery voltage map and update the battery status
      if (!body.batteryVoltages) {
        throw new BadRequestException('Invalid or missing battery voltages');
      }
      const batteryVoltages = body.batteryVoltages;
      Object.entries(batteryVoltages).forEach(([key, value]) => {
        if (typeof value !== 'number') {
          throw new BadRequestException(`Invalid voltage for battery ${key}`);
        }
        const battery = fetchBatteries.find((b) => b.battery_id === key);
        if (!battery) {
          throw new NotFoundException(`Battery with ID ${key} not found`);
        } else {
          if (value < 23) {
            battery.charged_status = 'discharged';
            battery.current_voltage = value;
          } else {
            battery.charged_status = 'charged';
            battery.current_voltage = value;
          }
          battery.current_flight_id = null; // Clear current flight ID
          battery.locationId = body.end_location; // Update location
        }
      });
      // Update chargind status as per the volatages in the body and make current flight null with the updated location of the battery
      for (const battery of fetchBatteries) {
        const updatedBattery = await battery.save();
        if (!updatedBattery) {
          throw new InternalServerErrorException(
            `Failed to update battery with ID ${battery.battery_id}`,
          );
        }
      }
      return {
        status: 'success',
        message: `${fetchBatteries.length} batteries disconnected successfully`,
        data: fetchBatteries.map((b) => ({ battery_id: b.battery_id })),
      };
    } catch (error) {
      console.error(`Error disconnecting battery:`, error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }

  async startCharging(batteryId: string) {
    try {
      // Fetch the battery by ID
      const battery = await this.batteryModel.findOne({
        battery_id: batteryId,
      });
      if (!battery) {
        throw new NotFoundException(`Battery with ID ${batteryId} not found`);
      } else if (
        battery.charged_status === 'charging' ||
        battery.charged_status === 'active' ||
        battery.charged_status === 'discarded'
      ) {
        throw new BadRequestException(
          `Battery with ID ${batteryId} is not in a state to start charging either because it is already charging, currently active in a drone, or has been discarded`,
        );
      } else {
        // Update the battery status to charging
        battery.charged_status = 'charging';
        // Save the updated battery
        const updatedBattery = await battery.save();
        if (!updatedBattery) {
          throw new InternalServerErrorException(
            `Failed to start charging for battery ${batteryId}`,
          );
        }
        return {
          status: 'success',
          message: `Battery ${batteryId} is now charging`,
          data: {
            battery_id: batteryId,
            charged_status: updatedBattery.charged_status,
          },
        };
      }
    } catch (error) {
      console.error(`Error starting charging for battery ${batteryId}:`, error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }

  async addChargeHistory(batteryId: string, dto: ChargeHistoryDto) {
    try {
      // 1. Fetch battery
      const battery = await this.batteryModel.findOne({
        battery_id: batteryId,
      });
      if (!battery) {
        throw new NotFoundException(`Battery with ID ${batteryId} not found`);
      }
      if (battery.charged_status !== 'charging') {
        throw new BadRequestException(
          `Battery with ID ${batteryId} is not currently charging`,
        );
      }

      // 3. Compute charging hours (fractional hours)
      const { charge_start_time, charge_end_time } = dto;

      // Parse into Date objects
      const startDate = new Date(charge_start_time);
      const endDate = new Date(charge_end_time);

      // Validate that they parsed correctly
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException(
          'Invalid date format for charge_start_time or charge_end_time',
        );
      }

      // Ensure end is after start
      if (endDate.getTime() <= startDate.getTime()) {
        throw new BadRequestException(
          'charge_end_time must be after charge_start_time',
        );
      }

      // Compute the difference in milliseconds, then convert to hours
      const msDiff = endDate.getTime() - startDate.getTime();
      const charging_hours = msDiff / (1000 * 60 * 60); // ms → s → min → hours

      
      const newHistory = {
        charge_start_time: startDate,
        charge_end_time: endDate,
        charging_hours, // computed field
        cell_voltage: dto.cell_voltage,
        maxVdiff: dto.maxVdiff,
        voltage_before_charge: dto.voltage_before_charge,
        voltage_after_charge: dto.voltage_after_charge,
        remark: dto.remark,
        monitor_by: dto.monitor_by,
      };

      // 5. Ensure the history array exists, then push
      battery.history = battery.history ?? [];
      battery.history.push(newHistory);
      // 6. Update current_voltage to the latest voltage_after_charge
      battery.current_voltage = dto.voltage_after_charge;

      // 7. Recompute curr_max_vdiff across all history entries
      battery.curr_max_vdiff = battery.history.reduce(
        (max, h: any) => Math.max(max, h.maxVdiff),
        battery.curr_max_vdiff || 0,
      );

      // 8. updated the cycle count by incrementing it by 1
      battery.cycle_count = (battery.cycle_count || 0) + 1;

      // 9. update the charging status to charged
      battery.charged_status = 'charged';

      // 10. Save and return
      const updated = await battery.save();
      if (!updated) {
        throw new InternalServerErrorException(
          `Failed to save charge history for battery ${batteryId}`,
        );
      }

      return {
        status: 'success',
        message: `Charge history added to battery ${batteryId}`,
        data: {
          battery_id: batteryId,
          charging_hours,
          current_voltage: updated.current_voltage,
          curr_max_vdiff: updated.curr_max_vdiff,
        },
      };
    } catch (error) {
      console.error(
        `Error adding charge history for battery ${batteryId}:`,
        error,
      );
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }

  async getBatteryById(batteryId: string) {
    try {
      const battery = await this.batteryModel.findOne({
        battery_id: batteryId,
      });
      if (!battery) {
        throw new NotFoundException(`Battery with ID ${batteryId} not found`);
      }
      return {
        status: 'success',
        message: `Battery with ID ${batteryId} found`,
        data: battery,
      };
    } catch (error) {
      console.error(`Error fetching battery with ID ${batteryId}:`, error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }

  async dicardBattery(batteryId: string) {
    try {
      const battery = await this.batteryModel.findOne({
        battery_id: batteryId,
      });
      if (!battery) {
        throw new NotFoundException(`Battery with ID ${batteryId} not found`);
      }
      if (battery.charged_status === 'discarded') {
        throw new BadRequestException(
          `Battery with ID ${batteryId} is already discarded`,
        );
      }
      if(battery.charged_status === 'charging' || battery.charged_status === 'active') {
        throw new BadRequestException(
          `Battery with ID ${batteryId} is currently charging or active in a drone and cannot be discarded`,
        );
      }
      // Update the battery status to discarded
      battery.charged_status = 'discarded';
      battery.isDiscarded = true; 
      const updatedBattery = await battery.save();
      if (!updatedBattery) {
        throw new InternalServerErrorException(
          `Failed to discard battery with ID ${batteryId}`,
        );
      }
      return {
        status: 'success',
        message: `Battery with ID ${batteryId} has been discarded`,
        data: {
          battery_id: batteryId,
          charged_status: updatedBattery.charged_status,
        },
      };
    } catch (error) {
      console.error(`Error discarding battery with ID ${batteryId}:`, error);
      const errMsg =
        error.response?.message || error.message || 'Unknown error';
      const code = error.status || 500;
      throwException(code, errMsg);
    }
  }
}
