import { Test, TestingModule } from '@nestjs/testing';
import { PlanestudioService } from './planestudio.service';

describe('PlanestudioService', () => {
  let service: PlanestudioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanestudioService],
    }).compile();

    service = module.get<PlanestudioService>(PlanestudioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
