import { Controller, Get, Body, Param, Delete, Put, UseGuards, Headers, Ip, BadRequestException } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { BdatService } from '../bdat/bdat.service';

@Controller('translation')
export class TranslationController {
  constructor(
    private readonly translationService: TranslationService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly bdatService: BdatService,
  ) {}

  @Get(':table')
  queryTranslatedTable(@Param('table') table: string) {
    return this.translationService.getMergedTranslatedTable(table);
  }

  @Get(':table/:id')
  findOne(@Param('table') table: string, @Param('id') row_id: number) {
    return this.translationService.findOne({ table, row_id });
  }

  @Put()
  @UseGuards(AuthGuard)
  async update(@Body() updateTranslationDto: UpdateTranslationDto, @Headers('authorization') authorization, @Ip() ip) {
    const decoded = await this.jwtService.verifyAsync(authorization.replace('Bearer ', ''));
    const { username } = decoded;
    const user = await this.userService.findOneByUsernameWithPassword(username);
    if (!user) {
      throw new BadRequestException("can't find user: " + username);
    }

    if (updateTranslationDto.row_id) {
      return await this.translationService.upsert(updateTranslationDto, user, ip);
    } else {
      const incomingRows = updateTranslationDto.text.split('\n');

      const sourceTableRows = await this.bdatService.queryTable('jp', updateTranslationDto.table);
      sourceTableRows.length;

      if (sourceTableRows.length !== incomingRows.length) {
        throw new BadRequestException(
          `incoming rows number: ${incomingRows.length} is not equivalent to original table.`,
        );
      }

      return await Promise.all(
        incomingRows.map((text, index) => {
          const singleRowUpdateTranslationDto = new UpdateTranslationDto();
          singleRowUpdateTranslationDto.text = text;
          singleRowUpdateTranslationDto.row_id = index + 1;
          singleRowUpdateTranslationDto.table = updateTranslationDto.table;
          return this.translationService.upsert(singleRowUpdateTranslationDto, user, ip, true);
        }),
      );
    }
  }
}
