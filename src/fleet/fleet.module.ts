import { Module } from '@nestjs/common';
import { FleetService } from './fleet.service';
import { FleetController } from './fleet.controller';
import { use } from 'passport';
import { UserModule } from 'src/user/user.module';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';

@Module({
  imports: [UserModule],
  controllers: [FleetController],
  providers: [FleetService, JwtAuthGuard],
})
export class FleetModule {}
