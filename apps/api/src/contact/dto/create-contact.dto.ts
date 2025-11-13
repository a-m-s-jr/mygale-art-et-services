import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @Length(1, 255)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @Length(0, 30)
  phone?: string;

  @IsString()
  @Length(1, 5000)
  message!: string;

  @IsOptional()
  @IsString()
  source?: string;
}
