import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BatteryService } from './battery.service';
import { Battery } from '../schema/battery.schema';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';
import {
  ChargeHistoryDto,
  CreateBatteryDto,
  DisconnectBatteryDto,
  FlightHistoryDto,
} from './dto/create-battery.dto';
import { Request } from 'express';

@Controller('batteries')
export class BatteryController {
  constructor(private readonly batteryService: BatteryService) {}

  /** Create a battery */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data: CreateBatteryDto, @Req() req: Request) {
    return this.batteryService.create(data, req);
  }

  /** Get all batteries */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<Battery[]> {
    return this.batteryService.findAll();
  }

  /** Get one battery by location ID */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Battery[]> {
    return this.batteryService.findOne(id);
  }

  // connect battery to the drone endpoint
  @UseGuards(JwtAuthGuard)
  @Put('connect')
  connect(@Body() body: FlightHistoryDto, @Req() req: Request) {
    return this.batteryService.connect(body, req);
  }
  @UseGuards(JwtAuthGuard)
  @Put('disconnect')
  disconnect(@Body() body: DisconnectBatteryDto, @Req() req: Request) {
    return this.batteryService.disconnect(body, req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('charge-history/:battery_id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async addChargeHistory(
    @Param('battery_id') batteryId: string,
    @Body() dto: ChargeHistoryDto,
  ) {
    return this.batteryService.addChargeHistory(batteryId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('start-charge/:battery_id')
  async startCharging(
    @Param('battery_id') batteryId: string,
  ) {
    return this.batteryService.startCharging(batteryId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('battery/:id')
  findOneById(@Param('id') id: string) {
    return this.batteryService.getBatteryById(id);
  }

    @UseGuards(JwtAuthGuard)
  @Put('discard/:battery_id')
  async discard(
    @Param('battery_id') batteryId: string,
  ) {
    return this.batteryService.dicardBattery(batteryId);
  }

}
