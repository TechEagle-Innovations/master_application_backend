import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FleetService } from './fleet.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';
import { Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

   @UseGuards(JwtAuthGuard)
   @Get('flight-history/:id')
   flightHistory(@Req() req: Request, @Param('id') id: string) {
    //console.log('Fetching flight history for drone ID:', id);
     return this.fleetService.flightHistoryOfDrone(req, id);
   }

}
