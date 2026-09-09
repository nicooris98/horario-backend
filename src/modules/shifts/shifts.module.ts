import { Module } from '@nestjs/common';
import { ShiftService } from './shifts.service';
import { ShiftController } from './shifts.controller';
import { Shift } from './entities/shifts.entity';
import { TypeOrmModule } from 'node_modules/@nestjs/typeorm/dist/typeorm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shift])
  ],
  controllers: [ShiftController],
  providers: [ShiftService],
})
export class ShiftModule {}
