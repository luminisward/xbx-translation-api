import { Controller, Get, Body, Param, Delete, Put, UseGuards, Headers, Query } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { FindConditions } from 'typeorm';
import { ChangesService } from './changes.service';
import { Changes } from './entities/changes.entity';

@Controller('changes')
export class ChangesController {
  constructor(private readonly changesService: ChangesService, private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return await this.changesService.findAll();
  }

  @Get(':table')
  async queryTranslatedTable(@Param('table') table: string, @Query('username') username) {
    const conditions: FindConditions<Changes> = { table };
    if (username) {
      const user = await this.userService.findOneByUsername(username);
      conditions.user = user;
    }
    return await this.changesService.find(conditions);
  }

  @Get(':table/:id')
  async findHistory(@Param('table') table: string, @Param('id') row_id: number, @Query('username') username) {
    return await this.changesService.find({ table, row_id });
  }
}
