import { Module } from '@nestjs/common';
import { BdatService } from './bdat.service';
import { BdatController } from './bdat.controller';

@Module({
  providers: [BdatService],
  controllers: [BdatController],
  exports: [BdatService],
})
export class BdatModule {}
