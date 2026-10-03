import { Test, TestingModule } from '@nestjs/testing';
import { AsignaciondocenteService } from './asignaciondocente.service';

describe('AsignaciondocenteService', () => {
  let service: AsignaciondocenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsignaciondocenteService],
    }).compile();

    service = module.get<AsignaciondocenteService>(AsignaciondocenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
