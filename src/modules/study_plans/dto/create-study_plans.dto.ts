export class CreateStudyPlanDto {
    nombre: string;
    carrera_id: number;
    fecha_desde: string;
    fecha_hasta?: string | null;
    estado?: boolean;
    resolucion_ministerial: string;
    anio_implementacion: number;
}
