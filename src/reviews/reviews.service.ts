import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { LoggingService } from '../common/services/logging.service';
import { CacheService } from '../common/services/cache.service';
import { CACHE_KEYS, CACHE_TTL } from '../common/constants/cache.constants';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
    private loggingService: LoggingService,
    private cacheService: CacheService,
  ) {}

  async findByRestaurant(restaurantId: number): Promise<Review[]> {
    const cacheKey = this.cacheService.generateKey(
      CACHE_KEYS.RESTAURANT_REVIEWS,
      {
        restaurantId,
      },
    );

    const cachedResult = await this.cacheService.get<Review[]>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const restaurant = await this.restaurantsRepository.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${restaurantId} not found`,
      );
    }

    const reviews = await this.reviewsRepository.find({
      where: { restaurant_id: restaurantId },
      order: { created_at: 'DESC' },
    });

    await this.cacheService.set(cacheKey, reviews, CACHE_TTL.DEFAULT);

    return reviews;
  }

  async create(
    restaurantId: number,
    userId: number,
    createReviewDto: CreateReviewDto,
    ip?: string,
  ): Promise<Review> {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${restaurantId} not found`,
      );
    }

    const review = this.reviewsRepository.create({
      restaurant_id: restaurantId,
      user_id: userId,
      ...createReviewDto,
    });

    const savedReview = await this.reviewsRepository.save(review);

    await this.cacheService.invalidateEntity(
      CACHE_KEYS.RESTAURANT_REVIEWS,
      restaurantId,
    );
    await this.cacheService.del(CACHE_KEYS.ADMIN_STATS);

    this.loggingService.logMessage(
      `Review created: ID ${savedReview.id} for restaurant ${restaurantId} by user ${userId} from IP: ${ip || 'unknown'}`,
      'REVIEW',
    );

    return savedReview;
  }

  async findByUser(userId: number): Promise<Review[]> {
    return await this.reviewsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOneByUser(reviewId: number, userId: number): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId, user_id: userId },
    });
    if (!review) {
      throw new NotFoundException(
        `Review with ID ${reviewId} not found or you don't have permission to access it`,
      );
    }
    return review;
  }

  async update(
    reviewId: number,
    userId: number,
    updateReviewDto: UpdateReviewDto,
    ip?: string,
  ): Promise<Review> {
    const review = await this.findOneByUser(reviewId, userId);

    Object.assign(review, updateReviewDto);
    const updatedReview = await this.reviewsRepository.save(review);

    await this.cacheService.invalidateEntity(
      CACHE_KEYS.RESTAURANT_REVIEWS,
      review.restaurant_id,
    );

    this.loggingService.logMessage(
      `Review updated: ID ${reviewId} by user ${userId} from IP: ${ip || 'unknown'}`,
      'REVIEW',
    );

    return updatedReview;
  }

  async remove(reviewId: number, userId: number, ip?: string): Promise<void> {
    const review = await this.findOneByUser(reviewId, userId);
    const restaurantId = review.restaurant_id;
    await this.reviewsRepository.remove(review);

    await this.cacheService.invalidateEntity(
      CACHE_KEYS.RESTAURANT_REVIEWS,
      restaurantId,
    );
    await this.cacheService.del(CACHE_KEYS.ADMIN_STATS);

    this.loggingService.logMessage(
      `Review deleted: ID ${reviewId} by user ${userId} from IP: ${ip || 'unknown'}`,
      'REVIEW',
    );
  }
}
