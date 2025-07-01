import { Controller, Post, Get, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { MaintainanceService } from './maintainance.service';
import { CreateMaintainanceDto } from './dto/create-maintainance.dto';
import { ReportIssueDto } from './dto/report-issue.dto';
import { FilterMaintainanceDto } from './dto/filter-maintainance.dto';
import { UpdateMaintainanceDto } from './dto/update-maintainance.dto';

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
} 