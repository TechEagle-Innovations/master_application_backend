import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { DroneService } from './drone.service';
import {  GetAllDroneDto } from './dto/get-drone.dto';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('drone')
export class DroneController {
  constructor(private readonly droneService: DroneService) {}

  @UseGuards(JwtAuthGuard)
  @Get('all-drone')
  allDrone(@Query() getAllDroneDto: GetAllDroneDto) {
    return this.droneService.allDrone(getAllDroneDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all-drones-at-hub')
  allDronesAtHub(@Req() req: Request) {
    return this.droneService.allCommissionedDronesAtHub(req);
  }


}
