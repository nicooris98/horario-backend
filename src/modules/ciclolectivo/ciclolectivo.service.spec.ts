import { Test, TestingModule } from '@nestjs/testing';
import { CiclolectivoService } from './ciclolectivo.service';

describe('CiclolectivoService', () => {
  let service: CiclolectivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CiclolectivoService],
    }).compile();

    service = module.get<CiclolectivoService>(CiclolectivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
