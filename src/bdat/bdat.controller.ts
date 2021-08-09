import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { BdatService } from './bdat.service';

@Controller('bdat')
export class BdatController {
  constructor(private readonly bdatService: BdatService) {}

  @Get('all')
  async getTables(): Promise<string[]> {
    const rows = await this.bdatService.getTables();
    return rows.filter((rowName) => rowName.includes('_ms'));
  }

  @Get(':tableName')
  async getOneTable(@Query('language') language: string, @Param('tableName') name) {
    const { rows } = await this.bdatService.queryTable(language || 'jp', name);
    return rows;
  }
  @Get(':tableName/:row_id')
  async getOneTableRow(@Query('language') language: string, @Param('tableName') name, @Param('row_id') row_id) {
    const row = await this.bdatService.queryTableRow(language || 'jp', name, row_id);
    if (row) {
      return row;
    }
    throw new NotFoundException(`table: ${name} row_id: ${row_id} not found`);
  }
}
