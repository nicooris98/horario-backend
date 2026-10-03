import { Test, TestingModule } from '@nestjs/testing';
import { AsignaciondocenteController } from './asignaciondocente.controller';
import { AsignaciondocenteService } from './asignaciondocente.service';

describe('AsignaciondocenteController', () => {
  let controller: AsignaciondocenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsignaciondocenteController],
      providers: [AsignaciondocenteService],
    }).compile();

    controller = module.get<AsignaciondocenteController>(AsignaciondocenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
