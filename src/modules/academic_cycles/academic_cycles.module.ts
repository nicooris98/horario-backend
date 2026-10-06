import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicCycle } from './entities/academic_cycle.entity';
import { AcademicCyclesController } from './academic_cycles.controller';
import { AcademicCyclesService } from './academic_cycles.service';

@Module({ imports: [TypeOrmModule.forFeature([AcademicCycle])], controllers: [AcademicCyclesController], providers: [AcademicCyclesService] })
export class AcademicCyclesModule {}
