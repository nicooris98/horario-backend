export class CreateStudyPlanDto {
  name: string;
  degreeId: number;
  durationYears: number;
  validityYear: number;
  startDate: string;
  endDate?: string | null;
  status?: string;
}
