import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Headers,
  InternalServerErrorException,
  Ip,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ExcelService } from './excel.service';
import { Readable } from 'stream';
import { Request, Response } from 'express';
import { TranslationService } from 'src/translation/translation.service';
import { BdatService } from 'src/bdat/bdat.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateTranslationDto } from '../translation/dto/update-translation.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Controller('excel')
export class ExcelController {
  isUploadRunning = false;

  constructor(
    private readonly excelService: ExcelService,
    private readonly translationService: TranslationService,
    private readonly bdatService: BdatService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async updateTranslationTable(
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authorization,
    @Ip() ip,
  ) {
    const decoded = await this.jwtService.verifyAsync(authorization.replace('Bearer ', ''));
    const { username } = decoded;
    const user = await this.userService.findOneByUsernameWithPassword(username);
    if (!user) {
      throw new BadRequestException("can't find user: " + username);
    }

    if (this.isUploadRunning) {
      return 'Another task is running.';
    }

    this.isUploadRunning = true;
    const tableFileName = file.originalname.split('.')[0];
    const data = this.excelService.parse(file.buffer);

    (async () => {
      try {
        for (const sheet of data) {
          const table = `${tableFileName}.${sheet.name}`;

          let textColumnIndex = 0;

          for (const row of sheet.data) {
            if (row[0] === '列名') {
              textColumnIndex = row.findIndex((val) => val === 'name');
              continue;
            }
            const key = row[0] as string;

            if (key && isFinite(Number(key))) {
              if (textColumnIndex === 0) {
                throw new InternalServerErrorException('textColumnIndex is 0');
              }

              const value = row[textColumnIndex] as string;
              const row_id = Number(key);
              const singleRowUpdateTranslationDto = new UpdateTranslationDto();
              singleRowUpdateTranslationDto.text = value || '';
              singleRowUpdateTranslationDto.row_id = row_id;
              singleRowUpdateTranslationDto.table = table;
              await this.translationService.upsert(singleRowUpdateTranslationDto, user, ip, true);
            }
          }
          console.log(`update ${table}`);
        }
      } finally {
        this.isUploadRunning = false;
      }
    })();

    return 'Task start running.';
  }
}
