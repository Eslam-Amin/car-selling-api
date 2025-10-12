import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dtos/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  createOne(reportDto: CreateReportDto) {
    const report = this.repo.create(reportDto);
    return this.repo.save(report);
  }

  async findAll(skip: number, limit: number) {
    const reportsCount = await this.repo.count();
    const reports = await this.repo.find({ skip, take: limit });
    return { reports, reportsCount };
  }

  async findOne(id: number) {
    const report = await this.repo.findOneBy({ id });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async updateOne(id: number, reportDto: Partial<CreateReportDto>) {
    const report = await this.repo.findOneBy({ id });
    if (!report) throw new NotFoundException('Report not found');
    Object.assign(report, reportDto);
    return this.repo.save(report);
  }

  async deleteOne(id: number) {
    const report = await this.repo.findOneBy({ id });
    if (!report) throw new NotFoundException('Report not found');
    return this.repo.delete(id);
  }

  async deleteAll() {
    return this.repo.clear();
  }
}
