import { IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FindDto {
  @ApiProperty()
  @IsInt()
  @Min(-1)
  @Max(1000)
  @Type(() => Number)
  limit: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset: number;
}
