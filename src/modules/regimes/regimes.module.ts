import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Regime } from './entities/regime.entity';
import { RegimesController } from './regimes.controller';
import { RegimesService } from './regimes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Regime])],
  controllers: [RegimesController],
  providers: [RegimesService],
})
export class RegimesModule {}
