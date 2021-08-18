import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { BdatModule } from 'src/bdat/bdat.module';
import { TranslationModule } from 'src/translation/translation.module';
import { UserModule } from '../user/user.module';

@Module({
  providers: [ExcelService],
  controllers: [ExcelController],
  imports: [BdatModule, TranslationModule, UserModule],
})
export class ExcelModule {}
