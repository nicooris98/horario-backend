import { Test, TestingModule } from '@nestjs/testing';
import { EspaciocurricularController } from './espaciocurricular.controller';
import { EspaciocurricularService } from './espaciocurricular.service';

describe('EspaciocurricularController', () => {
  let controller: EspaciocurricularController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EspaciocurricularController],
      providers: [EspaciocurricularService],
    }).compile();

    controller = module.get<EspaciocurricularController>(EspaciocurricularController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
