import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { Favorite } from '../entities/favorite.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../entities/user.entity';

@ApiTags('favorites')
@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('favorites/:restaurantId')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: 'Add a restaurant to favorites' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID',
    type: 'integer',
  })
  @ApiResponse({
    status: 201,
    description: 'Restaurant added to favorites successfully',
    type: Favorite,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid restaurant ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Restaurant already in favorites',
  })
  async addToFavorites(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @CurrentUser() user: User,
  ): Promise<Favorite> {
    return this.favoritesService.addToFavorites(user.id, restaurantId);
  }

  @Delete('favorites/:restaurantId')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove a restaurant from favorites' })
  @ApiParam({
    name: 'restaurantId',
    description: 'Restaurant ID',
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Restaurant removed from favorites successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found in favorites',
  })
  async removeFromFavorites(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.favoritesService.removeFromFavorites(user.id, restaurantId);
    return { message: 'Restaurant removed from favorites successfully' };
  }

  @Get('favorites')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({
    status: 200,
    description: 'List of user favorites',
    type: [Favorite],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async getFavorites(@CurrentUser() user: User): Promise<Favorite[]> {
    return this.favoritesService.getUserFavorites(user.id);
  }
}
