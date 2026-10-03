import { Module } from '@nestjs/common';
import { CuatrimestreService } from './cuatrimestre.service';
import { CuatrimestreController } from './cuatrimestre.controller';

@Module({
  controllers: [CuatrimestreController],
  providers: [CuatrimestreService],
})
export class CuatrimestreModule {}
