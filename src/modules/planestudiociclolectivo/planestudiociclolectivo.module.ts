import { Module } from '@nestjs/common';
import { PlanestudiociclolectivoService } from './planestudiociclolectivo.service';
import { PlanestudiociclolectivoController } from './planestudiociclolectivo.controller';

@Module({
  controllers: [PlanestudiociclolectivoController],
  providers: [PlanestudiociclolectivoService],
})
export class PlanestudiociclolectivoModule {}
