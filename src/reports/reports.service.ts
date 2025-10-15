import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from '../users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  createOne(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user;
    return this.repo.save(report);
  }

  async findAll(skip: number, limit: number) {
    const [reports, reportsCount] = await Promise.all([
      this.repo.find({ skip, take: limit, relations: ['user'] }),
      this.repo.count(),
    ]);
    return { reports, reportsCount };
  }

  async findOne(id: number) {
    const report = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });
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

  async getEstimate({ make, model, year, mileage, lng, lat }: GetEstimateDto) {
    return this.repo
      .createQueryBuilder('report')
      .select('AVG(price)', 'price')
      .where('LOWER(make) = :make', { make: make?.toLowerCase() })
      .andWhere('LOWER(model) = :model', { model: model?.toLowerCase() })
      .andWhere('lng -:lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat -:lat BETWEEN -5 AND 5', { lat })
      .andWhere('year -:year BETWEEN -3 AND 3', { year })
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
