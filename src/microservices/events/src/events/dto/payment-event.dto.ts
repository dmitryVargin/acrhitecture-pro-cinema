import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaymentEventDto {
  @IsInt()
  payment_id!: number;

  @IsInt()
  user_id!: number;

  @IsNumber()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsDateString()
  timestamp!: string;

  @IsOptional()
  @IsString()
  method_type?: string;
}