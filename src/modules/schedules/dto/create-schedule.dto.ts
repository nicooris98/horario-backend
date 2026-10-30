import { IsInt, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateScheduleDto {
  @IsInt()
  @Min(1)
  idCursado: number;

  @IsInt()
  @Min(1)
  idCuatrimestre: number;

  @IsInt()
  @Min(1)
  idHoraCatedra: number;

  @IsInt()
  @Min(1)
  idDia: number;

  @IsDateString({ strict: true })
  fechaDesde: string;

  @IsOptional()
  @IsDateString({ strict: true })
  fechaHasta?: string | null;
}