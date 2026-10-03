import { Module } from '@nestjs/common';
import { RegimenService } from './regimen.service';
import { RegimenController } from './regimen.controller';

@Module({
  controllers: [RegimenController],
  providers: [RegimenService],
})
export class RegimenModule {}
