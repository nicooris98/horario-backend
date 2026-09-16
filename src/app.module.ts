import { Module } from '@nestjs/common';
import { SubjectsModule } from './modules/curriculum_subjects/subjects.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DegreeModule } from './modules/degrees/degrees.module';
import { StudyPlanModule } from './modules/study_plans/study_plans.module';
import { AcademicCyclesModule } from './modules/academic_cycles/academic_cycles.module';
import { ClassPeriodsModule } from './modules/class_periods/class_periods.module';
import { CourseSectionsModule } from './modules/course_sections/course_sections.module';
import { CourseSectionAssignmentsModule } from './modules/course_section_assignments/course_section_assignments.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('DB_HOST', configService.get<string>('DB_NAME'))
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          database: configService.get<string>('DB_NAME'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
          port: configService.get<number>('DB_PORT'),
          entities: [
          __dirname + '/**/*.entity{.ts,.js}',
      ],
          synchronize: true
        }
      }
    }),
    SubjectsModule,
    AuthModule,
    DegreeModule,
    StudyPlanModule,
    AcademicCyclesModule,
    ClassPeriodsModule,
    CourseSectionsModule,
    CourseSectionAssignmentsModule,
    EnrollmentsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
