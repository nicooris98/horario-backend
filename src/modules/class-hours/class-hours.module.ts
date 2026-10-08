import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassHoursController } from './class-hours.controller';
import { ClassHoursService } from './class-hours.service';
import { ClassHour } from './entities/class-hour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassHour])],
  controllers: [ClassHoursController],
  providers: [ClassHoursService],
})
export class ClassHoursModule {}
