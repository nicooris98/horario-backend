import { Module } from '@nestjs/common';
import { AsignaturasModule } from './modules/asignaturas/asignaturas.module';

@Module({
  imports: [AsignaturasModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
