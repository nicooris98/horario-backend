import { Module } from '@nestjs/common';
import { EspaciocurricularcursodivisionService } from './espaciocurricularcursodivision.service';
import { EspaciocurricularcursodivisionController } from './espaciocurricularcursodivision.controller';

@Module({
  controllers: [EspaciocurricularcursodivisionController],
  providers: [EspaciocurricularcursodivisionService],
})
export class EspaciocurricularcursodivisionModule {}
