import { Test, TestingModule } from '@nestjs/testing';
import { CursodivisionService } from './cursodivision.service';

describe('CursodivisionService', () => {
  let service: CursodivisionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CursodivisionService],
    }).compile();

    service = module.get<CursodivisionService>(CursodivisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
