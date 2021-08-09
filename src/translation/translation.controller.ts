import { Controller, Get, Body, Param, Delete, Put } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { UpdateTranslationDto } from './dto/update-translation.dto';

@Controller('translation')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get()
  findAll() {
    return this.translationService.findAll();
  }

  @Get(':table')
  async queryTranslatedTable(@Param('table') table: string) {
    const rows = await this.translationService.find({ table });
    return rows.sort((row1, row2) => row1.row_id - row2.row_id);
  }

  @Get(':table/:id')
  findOne(@Param('table') table: string, @Param('id') row_id: number) {
    return this.translationService.findOne({ table, row_id });
  }

  @Put()
  update(@Body() updateTranslationDto: UpdateTranslationDto) {
    return this.translationService.upsert(updateTranslationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.translationService.remove(+id);
  }
}
