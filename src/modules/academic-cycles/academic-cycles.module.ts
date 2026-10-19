import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicCycle } from './entities/academic-cycle.entity';
import { AcademicCyclesController } from './academic-cycles.controller';
import { AcademicCyclesService } from './academic-cycles.service';

@Module({ imports: [TypeOrmModule.forFeature([AcademicCycle])], controllers: [AcademicCyclesController], providers: [AcademicCyclesService] })
export class AcademicCyclesModule {}
