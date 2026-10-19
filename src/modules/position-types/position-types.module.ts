import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionType } from './entities/position-type.entity';
import { PositionTypesController } from './position-types.controller';
import { PositionTypesService } from './position-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([PositionType])],
  controllers: [PositionTypesController],
  providers: [PositionTypesService],
  exports: [PositionTypesService],
})
export class PositionTypesModule {}
