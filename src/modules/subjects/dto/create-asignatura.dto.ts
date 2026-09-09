export class CreateAsignaturaDto {
	nombre: string;
	anio_cursada: number;
	activa?: boolean;
	regimen_dictado: string;
	horas_catedra_semanales: number;
	permite_multiples_docentes: boolean;
	cantidad_maxima_docentes?: number;
	plan_estudio_id: number;
}
