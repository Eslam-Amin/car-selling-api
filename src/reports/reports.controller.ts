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
import { AuthGuard } from 'src/guards/auth.guard';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}
  @Post()
  @UseGuards(AuthGuard)
  createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return this.reportsService.createOne(body, user);
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
