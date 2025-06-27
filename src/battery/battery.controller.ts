import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { BatteryService } from './battery.service';
import { Battery } from '../schema/battery.schema';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';

@Controller('batteries')
export class BatteryController {
  constructor(private readonly batteryService: BatteryService) {}

  /** Create a battery */
  @UseGuards(JwtAuthGuard) 
  @Post()
  create(@Body() data: Partial<Battery>): Promise<Battery> {
    return this.batteryService.create(data);
  }

  /** Get all batteries */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(): Promise<Battery[]> {
    return this.batteryService.findAll();
  }

  /** Get one battery by ID */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Battery[]> {
    return this.batteryService.findOne(id);
  }

  /** Update battery details */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Battery>): Promise<Battery> {
    return this.batteryService.update(id, data);
  }

  /** Delete a battery */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.batteryService.remove(id);
  }

  /** Connect battery to a flight and drone */
  @UseGuards(JwtAuthGuard)
  @Post(':id/connect')
  connect(
    @Param('id') id: string,
    @Body('flightId') flightId: string,
    @Body('droneId') droneId: string,
  ): Promise<Battery> {
    return this.batteryService.connect(id, flightId, droneId);
  }

  /** Disconnect battery: clears flight/drone and increments flight count */
  @UseGuards(JwtAuthGuard)
  @Post(':id/disconnect')
  disconnect(@Param('id') id: string): Promise<Battery> {
    return this.batteryService.disconnect(id);
  }

  /** Update charging percentage */
  @UseGuards(JwtAuthGuard)
  @Put(':id/charging')
  updateCharging(
    @Param('id') id: string,
    @Body('percentage') percentage: number,
  ): Promise<Battery> {
    return this.batteryService.updateCharging(id, percentage);
  }
}
