import { Module } from '@nestjs/common';
import { DegreeService } from './degrees.service';
import { DegreeController } from './degrees.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Degree } from './entities/degrees.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Degree])
  ],
  controllers: [DegreeController],
  providers: [DegreeService],
})
export class DegreeModule {}
