import { Module } from '@nestjs/common';
import { DocenteService } from './docente.service';
import { DocenteController } from './docente.controller';

@Module({
  controllers: [DocenteController],
  providers: [DocenteService],
})
export class DocenteModule {}
