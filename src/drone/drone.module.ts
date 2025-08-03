import { Module } from '@nestjs/common';
import { DroneService } from './drone.service';
import { DroneController } from './drone.controller';
import { UserModule } from 'src/user/user.module';
import { JwtAuthGuard } from 'src/user/guards/jwt-auth.guard';
import { ClearSkyModule } from 'src/clearsky/clearsky.module';
import { ClearSkyTokenService } from 'src/clearsky/clearsky-token.service';



@Module({
  imports: [UserModule, ClearSkyModule],
  controllers: [DroneController],
  providers: [DroneService, JwtAuthGuard ],
  exports: [DroneService]
})
export class DroneModule {}
