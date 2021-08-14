import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, Repository } from 'typeorm';
import { UpdateTranslationDto } from './dto/update-translation.dto';
import { Changes } from './entities/changes.entity';
import { Translation } from './entities/translation.entity';
import { BdatService } from '../bdat/bdat.service';
import { User } from 'src/user/entities/user.entity';

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

  async upsert(updateTranslationDto: UpdateTranslationDto, user: User, ip: string, isBatch = false) {
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
    change.user = user;
    change.ip = ip;
    change.isBatch = isBatch;

    await getConnection().transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.save(currentTranslation);
      await transactionalEntityManager.save(change);
    });

    return 'Success';
  }

  async getMergedTranslatedTable(table: string) {
    const originalCnRows = await this.bdatService.queryTable('cn', table);
    const translatedRows = await this.find({ table });

    return originalCnRows.map((row) => {
      const translatedRow = translatedRows.find((translatedRow) => translatedRow.row_id === row.row_id);
      return { row_id: row.row_id, text: translatedRow?.text || row.name };
    });
  }

  remove(id: number) {
    return `This action removes a #${id} translation`;
  }
}
