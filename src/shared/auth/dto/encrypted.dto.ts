import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 암호화된 데이터를 받는 DTO
 */
export class EncryptedDto {
  @IsString()
  @IsNotEmpty({ message: '암호화된 데이터가 필요합니다.' })
  encrypted: string;
}
