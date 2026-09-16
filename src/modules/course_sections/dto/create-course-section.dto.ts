export class CreateCourseSectionDto {
  academicCycleId: number;
  studyPlanId: number;
  degreeId: number;
  classPeriodId: number;
  courseYear: number;
  section: string;
  openingDate: string;
  closingDate?: string | null;
  status?: boolean;
}
