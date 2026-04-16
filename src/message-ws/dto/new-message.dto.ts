import { IsNotEmpty, IsString } from 'class-validator';

export class NewMessageDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
