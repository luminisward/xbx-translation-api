import { Controller, Get, Header, Post, Req, Res } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { Readable } from 'stream';
import { Request, Response } from 'express';
import { TranslationService } from 'src/translation/translation.service';
import { BdatService } from 'src/bdat/bdat.service';

@Controller('excel')
export class ExcelController {
  constructor(
    private readonly excelService: ExcelService,
    private readonly translationService: TranslationService,
    private readonly bdatService: BdatService,
  ) {}

  @Get(':tablePrefix')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async getTableExcel(@Res() res: Response, @Req() req: Request) {
    const { tablePrefix } = req.params;
    const allTable = await this.bdatService.getTablesMap();

    const tableData = await Promise.all(
      allTable[tablePrefix].map(async (tableSuffix) => {
        const translatedRows = await this.translationService.getMergedTranslatedTable(`${tablePrefix}.${tableSuffix}`);

        return {
          name: tableSuffix,
          data: translatedRows.map(({ row_id, text }) => [String(row_id), text]),
        };
      }),
    );

    const buffer = this.excelService.build(tableData);

    res.setHeader('Content-Disposition', `attachment; filename=${tablePrefix}.xlsx`);
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(res);
  }
}
