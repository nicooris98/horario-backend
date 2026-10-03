import { Module } from '@nestjs/common';
import { DiaService } from './dia.service';
import { DiaController } from './dia.controller';

@Module({
  controllers: [DiaController],
  providers: [DiaService],
})
export class DiaModule {}
