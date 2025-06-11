import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DroneService } from './drone.service';
import {  GetAllDroneDto } from './dto/get-drone.dto';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';

@Controller('drone')
export class DroneController {
  constructor(private readonly droneService: DroneService) {}

  @UseGuards(JwtAuthGuard)
  @Get('all-drone')
  allDrone(@Body() getAllDroneDto: GetAllDroneDto) {
    return this.droneService.allDrone(getAllDroneDto);
  }

  @Get()
  findAll() {
    return this.droneService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.droneService.findOne(+id);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.droneService.remove(+id);
  }
}
