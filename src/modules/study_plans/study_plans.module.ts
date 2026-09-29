import { Module } from '@nestjs/common';
import { StudyPlansService } from './study_plans.service';
import { StudyPlansController } from './study_plans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlan } from './entities/study_plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudyPlan])],
  controllers: [StudyPlansController],
  providers: [StudyPlansService],
})
export class StudyPlansModule {}
