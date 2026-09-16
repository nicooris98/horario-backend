export class CreateAsignaturaDto {
	name: string;
	year: number;
	regime: string;
	weeklyHours: number;
	allowsMultipleTeachers: boolean;
	maxTeachers?: number;
	studyPlanId: number;
	status?: boolean;
}
