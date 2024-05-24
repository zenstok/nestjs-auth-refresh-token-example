import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'admin@admin.com' })
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '1234',
  })
  readonly password: string;
}
