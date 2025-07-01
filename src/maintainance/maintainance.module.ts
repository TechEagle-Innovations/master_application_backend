import { Module } from '@nestjs/common';
import { MaintainanceController } from './maintainance.controller';
import { MaintainanceService } from './maintainance.service';
import { MaintainanceSchemaModule } from 'src/schema/maintainance/schema.module';

@Module({
  imports: [
    MaintainanceSchemaModule
  ],
  controllers: [MaintainanceController],
  providers: [MaintainanceService],
  exports: [MaintainanceService],
})
export class MaintainanceModule {} 