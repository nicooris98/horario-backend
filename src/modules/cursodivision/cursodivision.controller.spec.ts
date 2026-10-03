import { Test, TestingModule } from '@nestjs/testing';
import { CursodivisionController } from './cursodivision.controller';
import { CursodivisionService } from './cursodivision.service';

describe('CursodivisionController', () => {
  let controller: CursodivisionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CursodivisionController],
      providers: [CursodivisionService],
    }).compile();

    controller = module.get<CursodivisionController>(CursodivisionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
