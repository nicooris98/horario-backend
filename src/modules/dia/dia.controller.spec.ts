import { Test, TestingModule } from '@nestjs/testing';
import { DiaController } from './dia.controller';
import { DiaService } from './dia.service';

describe('DiaController', () => {
  let controller: DiaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiaController],
      providers: [DiaService],
    }).compile();

    controller = module.get<DiaController>(DiaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
