import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Query,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { FleetService } from './fleet.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';
import { Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  // This endpoint fetches all flight history for a specific drone.
  @UseGuards(JwtAuthGuard)
  @Get('flight-history/:id')
  flightHistory(@Req() req: Request, @Param('id') id: string) {
    //console.log('Fetching flight history for drone ID:', id);
    return this.fleetService.flightHistoryOfDrone(req, id);
  }

  // This endpoint fetches pre-flight checklist.
  @UseGuards(JwtAuthGuard)
  @Get('preflight-checklist')
  async fetch() {
    const token = process.env.CLEAR_SKY_API_KEY;
    if (!token) throw new UnauthorizedException('Missing Authorization header');
    const response = await this.fleetService.getPreflightChecklist(token);
    return response;
  }

  // This endpoint connect to the drone using its ID.
  @UseGuards(JwtAuthGuard)
  @Post('connect-drone')
  async connectDrone(@Query('droneId') droneId: string) {
    if (!droneId) throw new BadRequestException('droneId query required');
    const response = await this.fleetService.connectDrone(droneId);
    return response;
  }

  // This endpoint mark the pre flight checklist done as per the updates(pre flight checklist with all value marked as true) provided in body.
  @UseGuards(JwtAuthGuard)
  @Post('preflight-checklist-complete')
  async complete(
    @Body('updates') updates: Record<number, any>,
  ) {
    const token = process.env.CLEAR_SKY_API_KEY;
    if (!token) {
      throw new UnauthorizedException('API key for Clear Sky is not set');
    }
    if (!updates || typeof updates !== 'object') {
      throw new BadRequestException('Invalid or missing updates');
    }
    const response = await this.fleetService.completeChecklist(token, updates);
    return  response ;
  }
}
