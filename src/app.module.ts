import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignaciondocenteModule } from './modules/asignaciondocente/asignaciondocente.module';
import { CarreraModule } from './modules/carrera/carrera.module';
import { CiclolectivoModule } from './modules/ciclolectivo/ciclolectivo.module';
import { CuatrimestreModule } from './modules/cuatrimestre/cuatrimestre.module';
import { CursodivisionModule } from './modules/cursodivision/cursodivision.module';
import { DiaModule } from './modules/dia/dia.module';
import { DocenteModule } from './modules/docente/docente.module';
import { EspaciocurricularModule } from './modules/espaciocurricular/espaciocurricular.module';
import { EspaciocurricularcursodivisionModule } from './modules/espaciocurricularcursodivision/espaciocurricularcursodivision.module';
import { HoracatedraModule } from './modules/horacatedra/horacatedra.module';
import { HorarioModule } from './modules/horario/horario.module';
import { PlanestudioModule } from './modules/planestudio/planestudio.module';
import { PlanestudiociclolectivoModule } from './modules/planestudiociclolectivo/planestudiociclolectivo.module';
import { RegimenModule } from './modules/regimen/regimen.module';
import { TipocargoModule } from './modules/tipocargo/tipocargo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('DB_HOST', configService.get<string>('DB_NAME'))
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          database: configService.get<string>('DB_NAME'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
          port: configService.get<number>('DB_PORT'),
          entities: [
          __dirname + '/**/*.entity{.ts,.js}',
      ],
          synchronize: true
        }
      }
    }),
    AsignaciondocenteModule,
    CarreraModule,
    CiclolectivoModule,
    CuatrimestreModule,
    CursodivisionModule,
    DiaModule,
    DocenteModule,
    EspaciocurricularModule,
    EspaciocurricularcursodivisionModule,
    HoracatedraModule,
    HorarioModule,
    PlanestudioModule,
    PlanestudiociclolectivoModule,
    RegimenModule,
    TipocargoModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
