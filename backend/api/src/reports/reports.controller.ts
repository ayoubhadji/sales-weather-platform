import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GroqAdvisorService } from './Groq-advisor.service';
import { SustainabilityService } from './sustainability.service';
import { GetAiAdviceDto } from './dto/get-ai-advice.dto';
import { ChatWithAdvisorDto } from './dto/chat-with-advisor.dto';
import {
  WasteAvoidanceKPIDto,
  TimelinePointDto,
  ProductBreakdownDto,
} from './dto/sustainability.dto';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly groqAdvisorService: GroqAdvisorService,
    private readonly sustainabilityService: SustainabilityService,
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

  @Post('ai-chat')
  chatWithAdvisor(@Body() body: ChatWithAdvisorDto) {
    return this.groqAdvisorService.chatWithAdvisor(body);
  }

  @Get('sustainability/summary')
  getSustainabilitySummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<WasteAvoidanceKPIDto> {
    return this.sustainabilityService.calculateWasteAvoidance(startDate, endDate);
  }

  @Get('sustainability/timeline')
  getSustainabilityTimeline(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TimelinePointDto[]> {
    return this.sustainabilityService.getWasteTimeline(startDate, endDate);
  }

  @Get('sustainability/products')
  getSustainabilityProducts(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ProductBreakdownDto[]> {
    return this.sustainabilityService.getProductBreakdown(startDate, endDate);
  }
}