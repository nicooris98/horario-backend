import { Test, TestingModule } from '@nestjs/testing';
import { CuatrimestreController } from './cuatrimestre.controller';
import { CuatrimestreService } from './cuatrimestre.service';

describe('CuatrimestreController', () => {
  let controller: CuatrimestreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuatrimestreController],
      providers: [CuatrimestreService],
    }).compile();

    controller = module.get<CuatrimestreController>(CuatrimestreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
