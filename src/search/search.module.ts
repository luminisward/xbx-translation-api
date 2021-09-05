import { CacheModule, Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { TranslationModule } from '../translation/translation.module';
import { BdatModule } from '../bdat/bdat.module';

@Module({
  controllers: [SearchController],
  imports: [
    TranslationModule,
    BdatModule,
    CacheModule.register({
      ttl: 24 * 3600, //秒
      max: 10, //缓存中最大和最小数量
    }),
  ],
})
export class SearchModule {}
