import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { StudyPlan } from '../study_plans/entities/study_plans.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject, StudyPlan])
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
})
export class SubjectsModule {}
