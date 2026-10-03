import { Module } from '@nestjs/common';
import { EspaciocurricularService } from './espaciocurricular.service';
import { EspaciocurricularController } from './espaciocurricular.controller';

@Module({
  controllers: [EspaciocurricularController],
  providers: [EspaciocurricularService],
})
export class EspaciocurricularModule {}
