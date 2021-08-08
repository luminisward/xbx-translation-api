import { Test, TestingModule } from '@nestjs/testing';
import { BdatService } from './bdat.service';

describe('BdatService', () => {
  let service: BdatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BdatService],
    }).compile();

    service = module.get<BdatService>(BdatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
