import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDTO {
  @IsNotEmpty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @IsNotEmpty()
  @MinLength(8)
  @IsOptional()
  password?: string;
}
