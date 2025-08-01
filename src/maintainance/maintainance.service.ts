import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, isValidObjectId, Types } from 'mongoose';
import { DroneMaintenance, DroneMaintenanceDocument } from '../schema/maintainance/droneMaintenance.schema';
import { CreateMaintainanceDto } from './dto/create-maintainance.dto';
import { ReportIssueDto } from './dto/report-issue.dto';
import { FilterMaintainanceDto } from './dto/filter-maintainance.dto';
import { UpdateMaintainanceDto } from './dto/update-maintainance.dto';
import { DroneImagesAI, DroneImagesAIDocument } from '../schema/maintainance/droneImagesai.schema';
import { DroneService } from 'src/drone/drone.service';
import { FleetService } from 'src/fleet/fleet.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';

@Injectable()
export class MaintainanceService {
  constructor(
    @InjectModel(DroneMaintenance.name)
    private readonly maintainanceModel: Model<DroneMaintenanceDocument>,) {}

  async createRegular(dto: CreateMaintainanceDto) {
    if (!isValidObjectId(dto.droneId)) {
      throw new BadRequestException('Invalid droneId');
    }
    const conflict = await this.maintainanceModel.findOne({
      droneId: dto.droneId,
      maintenanceType: 'REGULAR',
      scheduledDate: dto.scheduledDate,
      status: { $in: ['PENDING', 'IN_PROGRESS'] },
    });
    if (conflict) {
      throw new BadRequestException('A regular maintenance is already scheduled for this drone at this time.');
    }
    try {
      const created = new this.maintainanceModel({ ...dto, maintenanceType: 'REGULAR' });
      return await created.save();
    } catch (err) {
      throw new InternalServerErrorException('Failed to create maintenance record', err.message);
    }
  }

  async reportIssue(dto: ReportIssueDto) {
    // if (!isValidObjectId(dto.droneId)) {
    //   throw new BadRequestException('Invalid droneId');
    // }
    if (!isValidObjectId(dto.reportedBy)) {
      throw new BadRequestException('Invalid reportedBy userId');
    }
    try {
      const created = new this.maintainanceModel({ ...dto, maintenanceType: 'ISSUE_REPORTED', status: 'PENDING' });
      return await created.save();
    } catch (err) {
      throw new InternalServerErrorException('Failed to report issue', err.message);
    }
  }

  async createDroneImagesAI(body: any) {
    if (!body.droneId || typeof body.droneId !== 'string') {
      throw new BadRequestException('droneId is required and must be a string');
    }
    if (!body.imageParts || typeof body.imageParts !== 'object') {
      throw new BadRequestException('imageParts is required and must be an object');
    }
    const exists = await this.droneImagesAIModel.findOne({ droneId: body.droneId });
    if (exists) {
      throw new BadRequestException('Record for this droneId already exists');
    }
    try {
      const created = new this.droneImagesAIModel(body);
      return await created.save();
    } catch (err) {
      throw new InternalServerErrorException('Failed to create DroneImagesAI record', err.message);
    }
  }

  async getDroneImagesAIByDroneId(droneId: string) {
    if (!droneId || typeof droneId !== 'string') {
      throw new BadRequestException('droneId is required and must be a string');
    }
    const record = await this.droneImagesAIModel.findOne({ droneId });
    if (!record) throw new NotFoundException('DroneImagesAI record not found');
    return record;
  }

  async findAll(filter: FilterMaintainanceDto) {
    const query: FilterQuery<DroneMaintenanceDocument> = {};
    if (filter.droneId) {
      if (!isValidObjectId(filter.droneId)) throw new BadRequestException('Invalid droneId');
      query.droneId = filter.droneId;
    }
    if (filter.maintenanceType) query.maintenanceType = filter.maintenanceType;
    if (filter.status) query.status = filter.status;
    if (filter.priority) query.priority = filter.priority;
    if (filter.fromDate || filter.toDate) {
      query.createdAt = {};
      if (filter.fromDate) query.createdAt.$gte = new Date(filter.fromDate);
      if (filter.toDate) query.createdAt.$lte = new Date(filter.toDate);
    }
    try {
      return await this.maintainanceModel.find(query).exec();
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch maintenance records', err.message);
    }
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid maintenance record id');
    let record;
    try {
      record = await this.maintainanceModel.findById(id).exec();
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch maintenance record', err.message);
    }
    if (!record) throw new NotFoundException('Maintenance record not found');
    return record;
  }

  async update(id: string, dto: UpdateMaintainanceDto) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid maintenance record id');
    try {
      const updated = await this.maintainanceModel.findByIdAndUpdate(id, dto, { new: true }).exec();
      if (!updated) throw new NotFoundException('Maintenance record not found');
      return updated;
    } catch (err) {
      throw new InternalServerErrorException('Failed to update maintenance record', err.message);
    }
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) throw new BadRequestException('Invalid maintenance record id');
    try {
      const deleted = await this.maintainanceModel.findByIdAndDelete(id).exec();
      if (!deleted) throw new NotFoundException('Maintenance record not found');
      return deleted;
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete maintenance record', err.message);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduleDailyMaintenance() {
    try {
      const drones = await this.droneService.getAllDrones();
      for (const d of drones) {
        const droneId = d._id.toString();

        const lastM = await this.maintainanceModel
          .findOne({ droneId: new Types.ObjectId(droneId), maintenanceType: 'REGULAR' })
          .sort({ scheduledDate: -1 })
          .exec();

      
        const staticCutoff = dayjs('2025-07-06T00:00:00.000Z');
        const cutoff = lastM
          ? dayjs(lastM.scheduledDate)
          : staticCutoff;

        const flights = await this.flightService.fetchAllFlight();
        const count = flights.filter(
          (f: any) =>
            f.drone_id === droneId &&
            dayjs(f.date_created).isAfter(cutoff),
        ).length;

        if (count > 10) {
          await this.createRegular({ droneId, scheduledDate: dayjs().toDate() });
        }
      }
    } catch (err) {
      throw new InternalServerErrorException('Failed to schedule maintenance: ' + err.message);
    }
  }
} 