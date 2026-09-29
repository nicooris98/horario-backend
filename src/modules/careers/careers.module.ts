import { Module } from '@nestjs/common';
import { CareersService } from './careers.service';
import { CareersController } from './careers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Careers } from './entities/careers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Careers])],
  controllers: [CareersController],
  providers: [CareersService],
})
export class CareersModule {}
