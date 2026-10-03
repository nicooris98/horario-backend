import { Test, TestingModule } from '@nestjs/testing';
import { PlanestudiociclolectivoController } from './planestudiociclolectivo.controller';
import { PlanestudiociclolectivoService } from './planestudiociclolectivo.service';

describe('PlanestudiociclolectivoController', () => {
  let controller: PlanestudiociclolectivoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanestudiociclolectivoController],
      providers: [PlanestudiociclolectivoService],
    }).compile();

    controller = module.get<PlanestudiociclolectivoController>(PlanestudiociclolectivoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
