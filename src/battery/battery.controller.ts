import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { BatteryService } from './battery.service';
import { Battery } from '../schema/battery.schema';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';
import { CreateBatteryDto, FlightHistoryDto } from './dto/create-battery.dto';
import { Request } from 'express';

@Controller('batteries')
export class BatteryController {
  constructor(private readonly batteryService: BatteryService) {}

  /** Create a battery */
  @UseGuards(JwtAuthGuard) 
  @Post()
  create(@Body() data: CreateBatteryDto, @Req() req: Request ) {
    return this.batteryService.create(data, req);
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

  // connect battery to the drone endpoint
  @UseGuards(JwtAuthGuard)
  @Put('connect/:id')
  connect(@Param('id') id: string, @Body() body: FlightHistoryDto, @Req() req: Request) {
    return this.batteryService.connect(id, body, req);
  }
}
