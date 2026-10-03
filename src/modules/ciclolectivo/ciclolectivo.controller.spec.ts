import { Test, TestingModule } from '@nestjs/testing';
import { CiclolectivoController } from './ciclolectivo.controller';
import { CiclolectivoService } from './ciclolectivo.service';

describe('CiclolectivoController', () => {
  let controller: CiclolectivoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CiclolectivoController],
      providers: [CiclolectivoService],
    }).compile();

    controller = module.get<CiclolectivoController>(CiclolectivoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
