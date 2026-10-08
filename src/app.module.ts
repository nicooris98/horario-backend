import { Module } from '@nestjs/common';
import { SubjectsModule } from './modules/curriculum_subjects/subjects.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DegreeModule } from './modules/degrees/degrees.module';
import { StudyPlanModule } from './modules/study_plans/study_plans.module';
import { AcademicCyclesModule } from './modules/academic_cycles/academic_cycles.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { RegimesModule } from './modules/regimes/regimes.module';
import { ClassHoursModule } from './modules/class_hours/class_hours.module';
import { SemestersModule } from './modules/semesters/semesters.module';
import { StudyPlanAcademicCyclesModule } from './modules/study_plan_academic_cycles/study_plan_academic_cycles.module';
import { CourseSectionsModule } from './modules/course_sections/course_sections.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('DB_HOST', configService.get<string>('DB_NAME'));
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
          synchronize: false
        }
      }
    }),
    SubjectsModule,
    AuthModule,
    DegreeModule,
    StudyPlanModule,
    AcademicCyclesModule,
    ShiftsModule,
    RegimesModule,
    ClassHoursModule,
    SemestersModule,
    StudyPlanAcademicCyclesModule,
    CourseSectionsModule,
    RolesModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
