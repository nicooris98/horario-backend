import { Test, TestingModule } from '@nestjs/testing';
import { PlanestudiociclolectivoService } from './planestudiociclolectivo.service';

describe('PlanestudiociclolectivoService', () => {
  let service: PlanestudiociclolectivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanestudiociclolectivoService],
    }).compile();

    service = module.get<PlanestudiociclolectivoService>(PlanestudiociclolectivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
