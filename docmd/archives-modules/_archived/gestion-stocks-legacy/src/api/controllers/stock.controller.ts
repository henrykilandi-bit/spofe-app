import {
  Controller,
  Get,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { StockReadRepository } from '../../infrastructure/repositories/read/stock-read.repository';

@Controller('/api/stocks')
export class StockController {
  constructor(private readonly repo: StockReadRepository) {}

  private tenant(req: any): string {
    return req.user.tenantId;
  }

  @Get('/depot/:depotId')
  async stockByDepot(@Req() req, @Param('depotId') depotId: string) {
    return {
      data: await this.repo.getStockByDepot(this.tenant(req), depotId),
      metadata: {
        module: 'gestion-stocks',
        version: 'v1.0.0',
        generatedAt: new Date().toISOString(),
      },
    };
  }

  @Get('/category/:category')
  async stockByCategory(@Req() req, @Param('category') category: string) {
    return {
      data: await this.repo.getStockByCategory(this.tenant(req), category),
      metadata: {
        module: 'gestion-stocks',
        version: 'v1.0.0',
        generatedAt: new Date().toISOString(),
      },
    };
  }

  @Get('/product/:productId')
  async stockByProduct(@Req() req, @Param('productId') productId: string) {
    return {
      data: await this.repo.getStockByProduct(this.tenant(req), productId),
      metadata: {
        module: 'gestion-stocks',
        version: 'v1.0.0',
        generatedAt: new Date().toISOString(),
      },
    };
  }

  @Get('/movements')
  async movements(
    @Req() req,
    @Query() query: any
  ) {
    return {
      data: await this.repo.getMovements(this.tenant(req), query),
      metadata: {
        module: 'gestion-stocks',
        version: 'v1.0.0',
        generatedAt: new Date().toISOString(),
      },
    };
  }
}