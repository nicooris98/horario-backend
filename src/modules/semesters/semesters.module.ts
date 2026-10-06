import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Semester } from './entities/semester.entity';
import { SemestersController } from './semesters.controller';
import { SemestersService } from './semesters.service';

@Module({
  imports: [TypeOrmModule.forFeature([Semester])],
  controllers: [SemestersController],
  providers: [SemestersService],
})
export class SemestersModule {}
