export class CreateStudyPlanDto {
    nombre: string;
    carrera_id: number;
    duracion: number;
    vigente?: boolean;
    activa?: boolean;
    resolucion_ministerial: string;
    anio_implementacion: number;
}
