import { Controller, Get, Param, Query } from '@nestjs/common';
import { BdatService } from './bdat.service';

@Controller('bdat')
export class BdatController {
  constructor(private readonly bdatService: BdatService) {}

  @Get('all')
  async getTables(): Promise<string[]> {
    return this.bdatService.getTables();
  }

  @Get(':tableName')
  async getOneTable(
    @Query('language') language: string,
    @Param('tableName') name,
  ) {
    const { rows } = await this.bdatService.queryTable(language || 'jp', name);
    return rows;
  }
}
