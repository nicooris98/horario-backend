import { Test, TestingModule } from '@nestjs/testing';
import { EspaciocurricularcursodivisionController } from './espaciocurricularcursodivision.controller';
import { EspaciocurricularcursodivisionService } from './espaciocurricularcursodivision.service';

describe('EspaciocurricularcursodivisionController', () => {
  let controller: EspaciocurricularcursodivisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EspaciocurricularcursodivisionController],
      providers: [EspaciocurricularcursodivisionService],
    }).compile();

    controller = module.get<EspaciocurricularcursodivisionController>(EspaciocurricularcursodivisionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
