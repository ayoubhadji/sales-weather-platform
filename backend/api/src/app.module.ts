import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { SalesTicketModule } from './sales-ticket/sales-ticket.module';
import { SalesItemModule } from './sales-item/sales-item.module';
import { WeatherModule } from './weather/weather.module';
import { SalesPredictionsModule } from './sales-predictions/sales-predictions.module';
import { PromotionsModule } from './promotions/promotions.module';
import { AlertsModule } from './alerts/alerts.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,

      autoLoadEntities: true,
      synchronize: true,
    }),

    ProductsModule,

    SalesTicketModule,

    SalesItemModule,

    WeatherModule,

    SalesPredictionsModule,

    PromotionsModule,

    AlertsModule,

    UsersModule,

    AuthModule,

    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
