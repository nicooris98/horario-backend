import { Test, TestingModule } from '@nestjs/testing';
import { RegimenService } from './regimen.service';

describe('RegimenService', () => {
  let service: RegimenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegimenService],
    }).compile();

    service = module.get<RegimenService>(RegimenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
