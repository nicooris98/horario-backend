import { Test, TestingModule } from '@nestjs/testing';
import { EspaciocurricularService } from './espaciocurricular.service';

describe('EspaciocurricularService', () => {
  let service: EspaciocurricularService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EspaciocurricularService],
    }).compile();

    service = module.get<EspaciocurricularService>(EspaciocurricularService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
