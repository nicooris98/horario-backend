import { Test, TestingModule } from '@nestjs/testing';
import { RegimenController } from './regimen.controller';
import { RegimenService } from './regimen.service';

describe('RegimenController', () => {
  let controller: RegimenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegimenController],
      providers: [RegimenService],
    }).compile();

    controller = module.get<RegimenController>(RegimenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
