import { Test, TestingModule } from '@nestjs/testing';
import { BdatController } from './bdat.controller';

describe('BdatController', () => {
  let controller: BdatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BdatController],
    }).compile();

    controller = module.get<BdatController>(BdatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
