import { Test, TestingModule } from '@nestjs/testing';
import { TipocargoService } from './tipocargo.service';

describe('TipocargoService', () => {
  let service: TipocargoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipocargoService],
    }).compile();

    service = module.get<TipocargoService>(TipocargoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
