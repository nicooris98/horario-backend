export class CreatePositionTypeDto {
  name: string;
  description?: string | null;
  allowsSubstitute?: boolean;
  status?: string;
}
