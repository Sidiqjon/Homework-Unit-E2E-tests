import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'MacBook Pro' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product price', example: 1299.99 })
  @IsNumber()
  price: number;
}
