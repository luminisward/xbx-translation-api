import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { TranslationController } from './translation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Changes } from './entities/changes.entity';
import { Translation } from './entities/translation.entity';
import { BdatModule } from '../bdat/bdat.module';
import { UserModule } from 'src/user/user.module';
import { ChangesController } from './changes.controller';
import { ChangesService } from './changes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Changes, Translation]), BdatModule, UserModule],
  controllers: [TranslationController, ChangesController],
  providers: [TranslationService, ChangesService],
})
export class TranslationModule {}
