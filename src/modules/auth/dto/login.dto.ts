import { PartialType } from '@nestjs/mapped-types';

export class LoginDto {
    email: string
    password: string
}
