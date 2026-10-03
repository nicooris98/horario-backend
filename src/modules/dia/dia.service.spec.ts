import { Test, TestingModule } from '@nestjs/testing';
import { DiaService } from './dia.service';

describe('DiaService', () => {
  let service: DiaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiaService],
    }).compile();

    service = module.get<DiaService>(DiaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
