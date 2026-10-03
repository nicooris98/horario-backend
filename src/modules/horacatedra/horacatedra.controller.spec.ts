import { Test, TestingModule } from '@nestjs/testing';
import { HoracatedraController } from './horacatedra.controller';
import { HoracatedraService } from './horacatedra.service';

describe('HoracatedraController', () => {
  let controller: HoracatedraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HoracatedraController],
      providers: [HoracatedraService],
    }).compile();

    controller = module.get<HoracatedraController>(HoracatedraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
