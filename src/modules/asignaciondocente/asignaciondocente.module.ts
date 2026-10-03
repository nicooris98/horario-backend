import { Module } from '@nestjs/common';
import { AsignaciondocenteService } from './asignaciondocente.service';
import { AsignaciondocenteController } from './asignaciondocente.controller';

@Module({
  controllers: [AsignaciondocenteController],
  providers: [AsignaciondocenteService],
})
export class AsignaciondocenteModule {}
