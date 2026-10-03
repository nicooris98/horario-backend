import { Module } from '@nestjs/common';
import { CiclolectivoService } from './ciclolectivo.service';
import { CiclolectivoController } from './ciclolectivo.controller';

@Module({
  controllers: [CiclolectivoController],
  providers: [CiclolectivoService],
})
export class CiclolectivoModule {}
