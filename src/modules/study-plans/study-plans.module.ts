import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlan } from './entities/study-plans.entity';
import { StudyPlanController } from './study-plans.controller';
import { StudyPlanService } from './study-plans.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudyPlan])],
  controllers: [StudyPlanController],
  providers: [StudyPlanService],
})
export class StudyPlanModule {}
