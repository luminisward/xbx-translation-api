import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { TranslationController } from './translation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Changes } from './entities/changes.entity';
import { Translation } from './entities/translation.entity';
import { BdatModule } from '../bdat/bdat.module';

@Module({
  imports: [TypeOrmModule.forFeature([Changes, Translation]), BdatModule],
  controllers: [TranslationController],
  providers: [TranslationService],
})
export class TranslationModule {}
