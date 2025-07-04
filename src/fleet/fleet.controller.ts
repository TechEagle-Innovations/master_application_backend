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
  @Get('preflight')
  async fetch(@Req() req: Request) {
    const token = req.headers['x-auth-clearsky'] as string;
    if (!token) throw new UnauthorizedException('Missing Authorization header');
    const response = await this.fleetService.getPreflightChecklist(token);
    return response;
  }

  // This endpoint connect to the drone using its ID.
  @UseGuards(JwtAuthGuard)
  @Post('connect-drone')
  async connectDrone(@Query('droneId') droneId:string) {
    if (!droneId) throw new BadRequestException('droneId query required');
    const response = await this.fleetService.connectDrone(droneId);
    return response;
  }

  // This endpoint mark the pre flight checklist done as per the updates(pre flight checklist with all value marked as true) provided in body.
  @UseGuards(JwtAuthGuard)
  @Post('preflight')
  async complete(
    @Req() req: Request,
    @Body('updates') updates: Record<number, any>,
  ) {
    const token = req.headers['x-auth-clearsky'] as string;
    if (!token) {
      throw new UnauthorizedException('API key for Clear Sky is not set');
    }
    if (!updates || typeof updates !== 'object') {
      throw new BadRequestException('Invalid or missing updates');
    }
    const response = await this.fleetService.completeChecklist(req,token, updates);
    return response;
  }

  // This endpoint fetches the post-flight checklist.
  @UseGuards(JwtAuthGuard)
  @Get('postflight')
  async fetchPostflightChecklist(@Req() req: Request): Promise<any> {
    const token = req.headers['x-auth-clearsky'] as string;
    return await this.fleetService.getPostflightChecklist(token);
  }

  // This endpoint marks the post-flight checklist as done with the updates provided in body.
  @UseGuards(JwtAuthGuard)
  @Post('postflight')
  async completePostflightChecklist(
    @Req() req: Request,
    @Body() updates: Record<number, any>,
  ): Promise<any> {
    const token = req.headers['x-auth-clearsky'] as string;
    return await this.fleetService.completePostflightChecklist(req, token, updates);
  }
}
