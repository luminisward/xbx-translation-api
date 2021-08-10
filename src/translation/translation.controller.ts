import { Controller, Get, Body, Param, Delete, Put, UseGuards, Headers, Ip } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Controller('translation')
export class TranslationController {
  constructor(
    private readonly translationService: TranslationService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

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
  @UseGuards(AuthGuard)
  async update(@Body() updateTranslationDto: UpdateTranslationDto, @Headers('authorization') authorization, @Ip() ip) {
    const decoded = await this.jwtService.verifyAsync(authorization.replace('Bearer ', ''));
    const { username } = decoded;
    const user = await this.userService.findOneByUsernameWithPassword(username);
    return await this.translationService.upsert(updateTranslationDto, user, ip);
  }
}
