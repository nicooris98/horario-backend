export class CreateAsignaturaDto {
  name: string;
  year: number;
  regimeId: number;
  weeklyHours: number;
  allowsMultipleTeachers: boolean;
  maxTeachers?: number | null;
  studyPlanId: number;
  status?: string;
}
