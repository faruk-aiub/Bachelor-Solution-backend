import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { LearningService } from './learning.service';

@ApiTags('Learning')
@Controller('api/v1/learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @ApiOperation({ summary: 'Get resources' })
  @Get()
  getResources(@Query('type') type?: string) {
    return this.learningService.getResources(type);
  }

  @ApiOperation({ summary: 'Add resource' })
  @Post()
  addResource(@Body() data: any) {
    return this.learningService.addResource(data);
  }

  @ApiOperation({ summary: 'Get single resource' })
  @Get(':id')
  getResourceById(@Param('id') id: string) {
    return this.learningService.getResourceById(id);
  }
}
