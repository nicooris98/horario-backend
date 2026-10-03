import { Test, TestingModule } from '@nestjs/testing';
import { TipocargoController } from './tipocargo.controller';
import { TipocargoService } from './tipocargo.service';

describe('TipocargoController', () => {
  let controller: TipocargoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipocargoController],
      providers: [TipocargoService],
    }).compile();

    controller = module.get<TipocargoController>(TipocargoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
