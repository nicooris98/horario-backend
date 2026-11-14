import { IsInt, Matches, Min } from 'class-validator';

const TIME = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export class CreateClassHourDto {
  @IsInt()
  @Min(1)
  slotNumber: number;

  @Matches(TIME, { message: 'startTime must use the HH:mm or HH:mm:ss format' })
  startTime: string;

  @Matches(TIME, { message: 'endTime must use the HH:mm or HH:mm:ss format' })
  endTime: string;
}
