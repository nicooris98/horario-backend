import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherAssignment } from './entities/teacher-assignment.entity';
import { TeacherAssignmentsController } from './teacher-assignments.controller';
import { TeacherAssignmentsService } from './teacher-assignments.service';
import { SchedulesModule } from '../schedules/schedules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeacherAssignment]),
    SchedulesModule,
  ],
  controllers: [TeacherAssignmentsController],
  providers: [TeacherAssignmentsService],
  exports: [TeacherAssignmentsService],
})
export class TeacherAssignmentsModule {}