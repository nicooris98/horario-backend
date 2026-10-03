import { Module } from '@nestjs/common';
import { PlanestudioService } from './planestudio.service';
import { PlanestudioController } from './planestudio.controller';

@Module({
  controllers: [PlanestudioController],
  providers: [PlanestudioService],
})
export class PlanestudioModule {}
