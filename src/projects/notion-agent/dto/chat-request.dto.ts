import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ChatTurnDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty({ message: '메시지를 입력해주세요.' })
  @MaxLength(4000, { message: '메시지는 4000자 이하여야 합니다.' })
  message: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ChatTurnDto)
  history?: ChatTurnDto[];
}
