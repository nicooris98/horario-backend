export class CreateStudyPlanDto {
    name: string;
    ministerialResolution: string;
    degreeId: number;
    durationYears: number;
    validityYear: number;
    startDate: string;
    endDate?: string | null;
    status?: boolean;
}
