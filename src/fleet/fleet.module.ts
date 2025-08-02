import { Module } from '@nestjs/common';
import { FleetService } from './fleet.service';
import { FleetController } from './fleet.controller';
import { use } from 'passport';
import { UserModule } from 'src/user/user.module';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FlightRecord, FlightRecordSchema } from '../schema/flight-record.schema';
import { ClearSkyModule } from 'src/clearsky/clearsky.module';
import { ClearSkyTokenService } from 'src/clearsky/clearsky-Token.service';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    MongooseModule.forFeature([{ name: FlightRecord.name, schema: FlightRecordSchema }]),
    ClearSkyModule
  ],
  controllers: [FleetController],
  providers: [FleetService, JwtAuthGuard,ClearSkyTokenService],
  exports: [FleetService]
})
export class FleetModule {}
