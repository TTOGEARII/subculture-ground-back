import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { sbEmail: email },
      withDeleted: false, // 삭제된 사용자는 제외
    });
    return user as User | null;
  }

  async findById(idx: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { idx },
      withDeleted: false,
    });
    return user as User | null;
  }

  async create(
    email: string,
    password: string,
    name: string,
    phone?: string,
    birthDate?: Date,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      sbEmail: email,
      sbPassword: hashedPassword,
      sbName: name,
      sbPhone: phone || null,
      sbBirthDate: birthDate || null,
      sbStatus: 1, // 기본값: 정상
      sbEmailVerifiedAt: null,
    });
    const savedUser = await this.userRepository.save(user);
    return savedUser as User;
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  }

  async updateStatus(idx: number, status: number): Promise<void> {
    await this.userRepository.update({ idx }, { sbStatus: status });
  }

  async verifyEmail(idx: number): Promise<void> {
    await this.userRepository.update(
      { idx },
      { sbEmailVerifiedAt: new Date() },
    );
  }
}
