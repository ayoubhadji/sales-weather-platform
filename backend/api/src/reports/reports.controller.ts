import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('franchiseId') franchiseId?: number,
  ) {
    return this.reportsService.getSummary(
      startDate,
      endDate,
      franchiseId,
    );
  }
  
  @Get('revenue-trend')
    getRevenueTrend(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('franchiseId') franchiseId?: number,
    ) {
    return this.reportsService.getRevenueTrend(
        startDate,
        endDate,
        franchiseId,
    );
    }


    @Get('category-sales')
      getCategorySales(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('franchiseId') franchiseId?: number,
      ) {
        return this.reportsService.getCategorySales(
          startDate,
          endDate,
          franchiseId,
        );
      }
}