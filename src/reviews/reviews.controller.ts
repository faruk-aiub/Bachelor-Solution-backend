import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Reviews')
@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'Get reviews for a provider' })
  @Get()
  getReviews(@Query('providerId') providerId?: string) {
    return this.reviewsService.getProviderReviews(providerId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add review' })
  @Post()
  addReview(
    @Request() req: any,
    @Body('providerId') providerId: string,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
  ) {
    return this.reviewsService.addReview(
      providerId,
      req.user.userId,
      rating,
      comment,
    );
  }

  @ApiOperation({ summary: 'Get single review' })
  @Get(':id')
  getReviewById(@Param('id') id: string) {
    return this.reviewsService.getReviewById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update review' })
  @Patch(':id')
  updateReview(
    @Request() req: any,
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
  ) {
    return this.reviewsService.updateReview(
      id,
      req.user.userId,
      rating,
      comment,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete review' })
  @Delete(':id')
  deleteReview(@Request() req: any, @Param('id') id: string) {
    return this.reviewsService.deleteReview(id, req.user.userId);
  }
}
