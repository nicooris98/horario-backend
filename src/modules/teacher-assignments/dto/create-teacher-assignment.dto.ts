export class CreateTeacherAssignmentDto {
  teacherId: number;
  positionTypeId: number;
  // Las suplencias lo heredan del titular y no hace falta mandarlo.
  courseSectionSubjectId?: number;
  // Solo para suplencias.
  replacedAssignmentId?: number | null;
  // Las suplencias lo heredan del titular y no hace falta mandarlo.
  weeklyHours?: number;
  startDate: string;
  endDate?: string | null;
}
