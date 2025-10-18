import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
  ) {}

  async findByRestaurant(restaurantId: number): Promise<Review[]> {
    const restaurant = await this.restaurantsRepository.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${restaurantId} not found`,
      );
    }

    return await this.reviewsRepository.find({
      where: { restaurant_id: restaurantId },
      order: { created_at: 'DESC' },
    });
  }

  async create(
    restaurantId: number,
    userId: number,
    createReviewDto: CreateReviewDto,
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

    return await this.reviewsRepository.save(review);
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
  ): Promise<Review> {
    const review = await this.findOneByUser(reviewId, userId);

    Object.assign(review, updateReviewDto);
    return await this.reviewsRepository.save(review);
  }

  async remove(reviewId: number, userId: number): Promise<void> {
    const review = await this.findOneByUser(reviewId, userId);
    await this.reviewsRepository.remove(review);
  }
}
