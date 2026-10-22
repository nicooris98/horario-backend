export class CreateTeacherDto {
  dni: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  fileNumber?: number | null;
  status?: string;
}
