import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserProfileDto } from './dto/user-profile.dto';
import { UsersService } from './users.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { plainToInstance } from 'class-transformer';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Return the current user profile.',
    type: UserProfileDto,
  })
  getProfile(@CurrentUser() user: User) {
    return plainToInstance(UserProfileDto, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }
}
