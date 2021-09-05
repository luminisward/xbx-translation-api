import {
  CACHE_MANAGER,
  CacheInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { TranslationService } from '../translation/translation.service';
import { BdatService } from '../bdat/bdat.service';
import { Cache } from 'cache-manager';

@Controller('search')
export class SearchController {
  constructor(
    private readonly translationService: TranslationService,
    private readonly bdatService: BdatService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('translation')
  @UseInterceptors(CacheInterceptor)
  searchTranslation(
    @Query('text') text: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.translationService.fullTextSearch(text, { page, limit });
  }

  @Get('bdat/:table?')
  async searchBdat(
    @Param('table') table: string,
    @Query('text') text: string,
    @Query('language') language: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    if (table) {
      return await this.bdatService.fullTextSearch(language, [table], text);
    }

    const cacheKey = `${text}:${language}`;
    let allItems: any[] = await this.cacheManager.get(cacheKey);
    if (!allItems) {
      const tables = await this.bdatService.getMsTables();
      allItems = await this.bdatService.fullTextSearch(language, tables, text);
      await this.cacheManager.set(cacheKey, allItems);
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const items = allItems.slice(start, end);

    return {
      items,
      meta: {
        totalItems: allItems.length,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(allItems.length / limit),
        currentPage: page,
      },
    };
  }
}
