import { Test, TestingModule } from '@nestjs/testing';
import { CuatrimestreService } from './cuatrimestre.service';

describe('CuatrimestreService', () => {
  let service: CuatrimestreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuatrimestreService],
    }).compile();

    service = module.get<CuatrimestreService>(CuatrimestreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
