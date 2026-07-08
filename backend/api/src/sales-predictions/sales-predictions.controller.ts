import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SalesPredictionsService } from './sales-predictions.service';
import { CreateSalesPredictionDto } from './dto/create-sales-prediction.dto';
import { UpdateSalesPredictionDto } from './dto/update-sales-prediction.dto';

@Controller('sales-predictions')
export class SalesPredictionsController {
  constructor(
    private readonly salesPredictionsService: SalesPredictionsService,
  ) {}

  @Post()
  create(@Body() createSalesPredictionDto: CreateSalesPredictionDto) {
    return this.salesPredictionsService.create(createSalesPredictionDto);
  }

  @Get()
  findAll() {
    return this.salesPredictionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesPredictionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSalesPredictionDto: UpdateSalesPredictionDto,
  ) {
    return this.salesPredictionsService.update(+id, updateSalesPredictionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salesPredictionsService.remove(+id);
  }
}
