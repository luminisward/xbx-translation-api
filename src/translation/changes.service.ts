import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { Changes } from './entities/changes.entity';
import { Translation } from './entities/translation.entity';
import { BdatService } from '../bdat/bdat.service';

@Injectable()
export class ChangesService {
  constructor(
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>,
    @InjectRepository(Changes)
    private changesRepository: Repository<Changes>,
    private readonly bdatService: BdatService,
  ) {}

  findAll() {
    return this.changesRepository.find({ order: { id: 'DESC' }, take: 5000 });
  }

  findOne(conditions) {
    return this.changesRepository.findOne(conditions);
  }

  async find(conditions) {
    const rows = await this.changesRepository.find({ where: conditions || {}, relations: ['user'] });
    return rows.map((row) => {
      delete row.user.permission;
      delete row.user.password;
      return row;
    });
  }
}
