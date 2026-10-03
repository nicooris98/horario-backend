import { Test, TestingModule } from '@nestjs/testing';
import { PlanestudioController } from './planestudio.controller';
import { PlanestudioService } from './planestudio.service';

describe('PlanestudioController', () => {
  let controller: PlanestudioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanestudioController],
      providers: [PlanestudioService],
    }).compile();

    controller = module.get<PlanestudioController>(PlanestudioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
