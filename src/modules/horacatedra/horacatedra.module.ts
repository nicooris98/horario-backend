import { Module } from '@nestjs/common';
import { HoracatedraService } from './horacatedra.service';
import { HoracatedraController } from './horacatedra.controller';

@Module({
  controllers: [HoracatedraController],
  providers: [HoracatedraService],
})
export class HoracatedraModule {}
