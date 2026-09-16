import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseSectionAssignmentDto } from './create-course-section-assignment.dto';

export class UpdateCourseSectionAssignmentDto extends PartialType(CreateCourseSectionAssignmentDto) {}
