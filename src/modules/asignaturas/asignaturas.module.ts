import { Module } from '@nestjs/common';
import { AsignaturasService } from './asignaturas.service';
import { AsignaturasController } from './asignaturas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asignatura } from './entities/asignatura.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asignatura])
  ],
  controllers: [AsignaturasController],
  providers: [AsignaturasService],
})
export class AsignaturasModule {}
