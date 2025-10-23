import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { CACHE_KEYS } from '../common/constants/cache.constants';
import { UserRole } from '../common/enums/user-role.enum';
import { CacheService } from '../common/services/cache.service';
import { LoggingService } from '../common/services/logging.service';
import { User } from '../entities/user.entity';

import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private loggingService: LoggingService,
    private cacheService: CacheService,
  ) {}
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, role = UserRole.USER } = registerDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
      created_at: new Date().toISOString(),
    });

    const savedUser = await this.usersRepository.save(user);

    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };
    const access_token = this.jwtService.sign(payload);

    await this.cacheService.del(CACHE_KEYS.ADMIN_STATS);

    this.loggingService.logMessage(
      `User registration: ${savedUser.email} (ID: ${savedUser.id}) from IP: unknown`,
      'AUTH',
    );

    return {
      access_token,
      user_id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      this.loggingService.logMessage(
        `Failed login attempt: ${email} from IP: unknown - User not found`,
        'AUTH',
        'warn',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.loggingService.logMessage(
        `Failed login attempt: ${email} from IP: unknown - Invalid password`,
        'AUTH',
        'warn',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    this.loggingService.logMessage(
      `User login: ${user.email} (ID: ${user.id}) from IP: unknown`,
      'AUTH',
    );

    return {
      access_token,
      user_id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async validateUser(userId: number): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({
        where: { id: userId },
      });
    } catch {
      return null;
    }
  }
}
