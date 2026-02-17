import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
  Logger,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PerformanceService } from './performance.service';
import { CreatePerformanceDto } from './dto/create-performance.dto';
import { UpdatePerformanceDto } from './dto/update-performance.dto';
import { EncryptedDto } from '../auth/dto/encrypted.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/types/user-payload.interface';
import { decryptObject, encryptObject } from '../common/utils/crypto.util';
import { saveFile, generateUniqueFilename, getFileUrl } from '../common/utils/file.util';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Controller('events')
export class PerformanceController {
  private readonly logger = new Logger(PerformanceController.name);

  constructor(private readonly performanceService: PerformanceService) {}

  @Get()
  async getEvents(@Query('userIdx') userIdx?: string) {
    try {
      // userIdx 쿼리 파라미터가 있으면 해당 사용자의 공연만 조회
      if (userIdx && !Number.isNaN(Number(userIdx))) {
        return await this.performanceService.findByUserIdx(Number(userIdx));
      }
      return await this.performanceService.findAll();
    } catch (error) {
      this.logger.error('공연 목록 조회 실패', error.stack);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '공연 목록을 불러오는데 실패했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyEvents(@CurrentUser() user: UserPayload) {
    try {
      return await this.performanceService.findByUserIdx(user.idx);
    } catch (error) {
      this.logger.error('내 공연 목록 조회 실패', error.stack);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '내 공연 목록을 불러오는데 실패했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPerformance(
    @Body() encryptedDto: EncryptedDto,
    @CurrentUser() user: UserPayload,
  ) {
    try {
      const createDto = decryptObject<CreatePerformanceDto>(encryptedDto.encrypted);
      const performance = await this.performanceService.create(createDto, user.idx);
      const encryptedResponse = encryptObject(performance);
      return { encrypted: encryptedResponse };
    } catch (error) {
      this.logger.error('공연 생성 실패', error.stack);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '공연 생성에 실패했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updatePerformance(
    @Param('id') id: string,
    @Body() encryptedDto: EncryptedDto,
    @CurrentUser() user: UserPayload,
  ) {
    try {
      const updateDto = decryptObject<UpdatePerformanceDto>(encryptedDto.encrypted);
      const performance = await this.performanceService.update(
        Number(id),
        updateDto,
        user.idx,
      );

      if (!performance) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: '공연을 찾을 수 없습니다.',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const encryptedResponse = encryptObject(performance);
      return { encrypted: encryptedResponse };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`공연 수정 실패 (id: ${id})`, error.stack);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '공연 수정에 실패했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePerformance(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    try {
      await this.performanceService.remove(Number(id), user.idx);
      return { message: '공연이 삭제되었습니다.' };
    } catch (error) {
      this.logger.error(`공연 삭제 실패 (id: ${id})`, error.stack);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '공연 삭제에 실패했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new HttpException(
              {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'JPG, JPEG, PNG 형식만 업로드 가능합니다.',
              },
              HttpStatus.BAD_REQUEST,
            ) as any,
            false,
          );
        }
      },
    }),
  )
  async uploadImage(@UploadedFile() file: UploadedFile) {
    try {
      if (!file) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: '이미지 파일이 없습니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const filename = generateUniqueFilename(file.originalname);
      await saveFile(file.buffer, filename);
      const fileUrl = getFileUrl(filename);

      this.logger.log(`이미지 업로드 성공: ${filename}`);
      return { url: fileUrl, filename };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('이미지 업로드 실패', error.stack);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '이미지 업로드에 실패했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getEvent(@Param('id') id: string) {
    try {
      const performance = await this.performanceService.findOne(Number(id));
      
      if (!performance) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: '공연을 찾을 수 없습니다.',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return performance;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`공연 조회 실패 (id: ${id})`, error.stack);
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: '공연 정보를 불러오는데 실패했습니다.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
