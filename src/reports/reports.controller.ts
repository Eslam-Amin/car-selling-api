import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dtos/create-report.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Serialize } from '../interceptors/serialize.interceptor';
import { ReportDto } from './dtos/report.dto';
import { IsAdminGuard } from '../guards/isAdmin.guard';

@Controller('reports')
@UseGuards(AuthGuard)
@Serialize(ReportDto)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}
  @Post()
  @UseGuards(AuthGuard)
  async createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    const report = await this.reportsService.createOne(body, user);
    return {
      message: 'Report created successfully',
      data: report,
    };
  }

  @Get()
  async getReports(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const skip = (page - 1) * limit;
    const { reports, reportsCount } = await this.reportsService.findAll(
      skip,
      limit,
    );
    return {
      message: 'Reports fetched successfully',
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(reportsCount / limit),
        total: reportsCount,
      },
      data: reports,
    };
  }

  @Get('/:id')
  async getReport(@Param('id', ParseIntPipe) id: number) {
    const report = await this.reportsService.findOne(id);
    return {
      message: 'Report fetched successfully',
      data: report,
    };
  }

  @Patch('/:id')
  async updateReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<CreateReportDto>,
  ) {
    const report = await this.reportsService.updateOne(id, body);
    return {
      message: 'Report updated successfully',
      data: report,
    };
  }

  @Patch('/:id/approve')
  @UseGuards(IsAdminGuard)
  async approveReport(@Param('id', ParseIntPipe) id: number) {
    const report = await this.reportsService.updateOne(id, { approved: true });
    return {
      message: 'Report approved successfully',
      data: report,
    };
  }

  @Delete('/:id')
  async deleteReport(@Param('id', ParseIntPipe) id: number) {
    await this.reportsService.deleteOne(id);
    return {
      message: 'Report deleted successfully',
      data: {},
    };
  }

  @Delete()
  async deleteAllReports() {
    await this.reportsService.deleteAll();
    return {
      message: 'All reports deleted successfully',
      data: {},
    };
  }
}
