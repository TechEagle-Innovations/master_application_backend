import { Controller, Post, Get, Patch, Delete, Param, Body, Query} from '@nestjs/common';
import { MaintainanceService } from './maintainance.service';
import { CreateMaintainanceDto } from './dto/create-maintainance.dto';
import { ReportIssueDto } from './dto/report-issue.dto';
import { FilterMaintainanceDto } from './dto/filter-maintainance.dto';
import { UpdateMaintainanceDto } from './dto/update-maintainance.dto';
import { CreateDroneImagesAIDto } from './dto/create-drone-images-ai.dto';
import { ResolveMaintenanceDto } from './dto/resolve-issue.dto';
import { DroneMaintenance } from 'src/schema/maintainance/droneMaintenance.schema';

@Controller('maintainance')
export class MaintainanceController {
  constructor(private readonly maintainanceService: MaintainanceService) {}

  @Post()
  createRegular(@Body() dto: CreateMaintainanceDto) {
    return this.maintainanceService.createRegular(dto);
  }

  @Post('report-issue')
  reportIssue(@Body() dto: ReportIssueDto) {
    return this.maintainanceService.reportIssue(dto);
  }

  @Post('drone-images-ai')
  async createDroneImagesAI(@Body() body: CreateDroneImagesAIDto) {
    return this.maintainanceService.createDroneImagesAI(body);
  }

  @Get('drone-images-ai/:droneId')
  async getDroneImagesAIByDroneId(@Param('droneId') droneId: string) {
    return this.maintainanceService.getDroneImagesAIByDroneId(droneId);
  }

  @Get()
  findAll(@Query() filter: FilterMaintainanceDto) {
    return this.maintainanceService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintainanceService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMaintainanceDto) {
    return this.maintainanceService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintainanceService.remove(id);
  }
  @Patch(':id')
  async updateMaintenance(
    @Param('id') id: string,
    @Body() dto: ResolveMaintenanceDto,
  ): Promise<DroneMaintenance> {
    return this.maintainanceService.update(id, dto);
  }
} 