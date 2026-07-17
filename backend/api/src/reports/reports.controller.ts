import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GroqAdvisorService } from './Groq-advisor.service';
import { GetAiAdviceDto } from './dto/get-ai-advice.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly groqAdvisorService: GroqAdvisorService,
  ) {}

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

  @Post('ai-advice')
  getAiAdvice(@Body() body: GetAiAdviceDto) {
    return this.groqAdvisorService.getBusinessAdvice(body);
  }
}