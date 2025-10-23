import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { RolesGuard } from '../common/guards/roles.guard';

import { AdminService } from './admin.service';
import { TopRestaurantsStatsDto } from './dto/restaurant-stats.dto';
import { StatsDto } from './dto/stats.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description:
      'Return platform statistics including user, restaurant, and review counts.',
    type: StatsDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin access required.',
  })
  async getStats(): Promise<StatsDto> {
    const stats = await this.adminService.getStats();
    return plainToInstance(StatsDto, stats);
  }

  @Get('restaurants/top')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get top rated and most reviewed restaurants (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return top 3 rated restaurants and top 3 most reviewed restaurants.',
    type: TopRestaurantsStatsDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin access required.',
  })
  async getTopRestaurantsStats(): Promise<TopRestaurantsStatsDto> {
    const stats = await this.adminService.getTopRestaurantsStats();
    return plainToInstance(TopRestaurantsStatsDto, stats);
  }
}
