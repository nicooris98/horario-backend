import { Test, TestingModule } from '@nestjs/testing';
import { EspaciocurricularcursodivisionService } from './espaciocurricularcursodivision.service';

describe('EspaciocurricularcursodivisionService', () => {
  let service: EspaciocurricularcursodivisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EspaciocurricularcursodivisionService],
    }).compile();

    service = module.get<EspaciocurricularcursodivisionService>(EspaciocurricularcursodivisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
