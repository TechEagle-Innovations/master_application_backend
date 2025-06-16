import { Module } from '@nestjs/common';
import { DroneService } from './drone.service';
import { DroneController } from './drone.controller';
import { UserModule } from 'src/user/user.module';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';

@Module({
  imports: [UserModule],
  controllers: [DroneController],
  providers: [DroneService, JwtAuthGuard],
})
export class DroneModule {}
