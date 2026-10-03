import { Module } from '@nestjs/common';
import { CursodivisionService } from './cursodivision.service';
import { CursodivisionController } from './cursodivision.controller';

@Module({
  controllers: [CursodivisionController],
  providers: [CursodivisionService],
})
export class CursodivisionModule {}
