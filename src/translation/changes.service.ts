import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { Changes } from './entities/changes.entity';
import { Translation } from './entities/translation.entity';
import { BdatService } from '../bdat/bdat.service';
import { User } from '../user/entities/user.entity';

function filterUserData(user: User) {
  user.password = undefined;
  user.permission = undefined;
  return user;
}

@Injectable()
export class ChangesService {
  constructor(
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>,
    @InjectRepository(Changes)
    private changesRepository: Repository<Changes>,
    private readonly bdatService: BdatService,
  ) {}

  async findAll() {
    const rows = await this.changesRepository.find({ relations: ['user'], order: { id: 'DESC' }, take: 5000 });
    return rows.map((row) => {
      row.user = filterUserData(row.user);
      return row;
    });
  }

  findOne(conditions) {
    return this.changesRepository.findOne(conditions);
  }

  async find(conditions) {
    const rows = await this.changesRepository.find({ where: conditions || {}, relations: ['user'] });
    return rows.map((row) => {
      row.user = filterUserData(row.user);
      return row;
    });
  }
}
