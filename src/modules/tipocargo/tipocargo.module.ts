import { Module } from '@nestjs/common';
import { TipocargoService } from './tipocargo.service';
import { TipocargoController } from './tipocargo.controller';

@Module({
  controllers: [TipocargoController],
  providers: [TipocargoService],
})
export class TipocargoModule {}
