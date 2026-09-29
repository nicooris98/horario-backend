import { Test, TestingModule } from '@nestjs/testing';
import { StudyPlansController } from './study_plans.controller';
import { StudyPlansService } from './study_plans.service';

describe('StudyPlansController', () => {
  let controller: StudyPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyPlansController],
      providers: [StudyPlansService],
    }).compile();

    controller = module.get<StudyPlansController>(StudyPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
