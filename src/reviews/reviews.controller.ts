import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from '../entities/review.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../entities/user.entity';

@ApiTags('reviews')
@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':id/reviews')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @ApiOperation({ summary: 'Create a review for a restaurant' })
  @ApiParam({
    name: 'id',
    description: 'Restaurant ID',
    type: 'integer',
  })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    type: Review,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid review data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Restaurant not found',
  })
  async create(
    @Param('id', ParseIntPipe) restaurantId: number,
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: User,
  ): Promise<Review> {
    return this.reviewsService.create(restaurantId, user.id, createReviewDto);
  }
}

@ApiTags('reviews')
@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('reviews')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get reviews created by the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of user reviews',
    type: [Review],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async findUserReviews(@CurrentUser() user: User): Promise<Review[]> {
    return this.reviewsService.findByUser(user.id);
  }

  @Put('reviews/:id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Edit a review created by the authenticated user' })
  @ApiParam({
    name: 'id',
    description: 'Review ID',
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
    type: Review,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid review data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found or access denied',
  })
  async updateReview(
    @Param('id', ParseIntPipe) reviewId: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user: User,
  ): Promise<Review> {
    return this.reviewsService.update(reviewId, user.id, updateReviewDto);
  }

  @Delete('reviews/:id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Delete a review created by the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Review ID',
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Review deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found or access denied',
  })
  async deleteReview(
    @Param('id', ParseIntPipe) reviewId: number,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.reviewsService.remove(reviewId, user.id);
    return { message: 'Review deleted successfully' };
  }
}
