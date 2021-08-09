import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { Changes } from './entities/changes.entity';
import { Translation } from './entities/translation.entity';
import { BdatService } from '../bdat/bdat.service';

@Injectable()
export class TranslationService {
  constructor(
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>,
    @InjectRepository(Changes)
    private changesRepository: Repository<Changes>,
    private readonly bdatService: BdatService,
  ) {}

  findAll() {
    return `This action returns all translation`;
  }

  findOne(conditions) {
    return this.translationRepository.findOne(conditions);
  }

  find(conditions) {
    return this.translationRepository.find(conditions);
  }

  async upsert(updateTranslationDto: UpdateTranslationDto) {
    const { table, row_id, text } = updateTranslationDto;
    let currentTranslation = await this.translationRepository.findOne({ table, row_id });

    if (currentTranslation) {
      if (currentTranslation.text === text) {
        return 'Same';
      }
      currentTranslation.text = text;
    } else {
      const oldCnRow = await this.bdatService.queryTableRow('cn', table, row_id);
      if (oldCnRow.name === text) {
        return 'Same as bdat';
      }

      currentTranslation = this.translationRepository.create();
      currentTranslation.text = text;
      currentTranslation.table = table;
      currentTranslation.row_id = row_id;
    }

    const change = await this.changesRepository.create();
    change.text = text;
    change.row_id = row_id;
    change.table = table;
    change.user;

    await getConnection().transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(currentTranslation);
      await transactionalEntityManager.save(change);
    });

    return 'Success';
  }

  remove(id: number) {
    return `This action removes a #${id} translation`;
  }
}
