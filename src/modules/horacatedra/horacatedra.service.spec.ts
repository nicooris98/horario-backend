import { Test, TestingModule } from '@nestjs/testing';
import { HoracatedraService } from './horacatedra.service';

describe('HoracatedraService', () => {
  let service: HoracatedraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HoracatedraService],
    }).compile();

    service = module.get<HoracatedraService>(HoracatedraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
