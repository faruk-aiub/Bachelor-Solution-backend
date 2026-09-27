import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards, Request, UnauthorizedException, Delete } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Jobs')
@Controller('api/v1/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Get all jobs' })
  @Get()
  getAllJobs(@Query('type') type?: string) {
    return this.jobsService.getAllJobs(type);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create job posting' })
  @Post()
  createJobPosting(
    @Request() req: any,
    @Body() data: any
  ) {
    return this.jobsService.createJobPosting(req.user.userId, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Apply for job' })
  @Post('apply')
  applyForJob(
    @Request() req: any,
    @Body('jobId') jobId: string,
  ) {
    return this.jobsService.applyForJob(jobId, req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my applications' })
  @Get('my-applications')
  getMyApplications(@Request() req: any) {
    return this.jobsService.getMyApplications(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my posted jobs' })
  @Get('my-jobs')
  getMyPostedJobs(@Request() req: any) {
    return this.jobsService.getMyPostedJobs(req.user.userId);
  }

  // New endpoints for employer
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get applicants' })
  @Get(':jobId/applicants')
  getApplicants(
    @Request() req: any,
    @Param('jobId') jobId: string,
  ) {
    // In a real app, verify that req.user.userId is the owner of this job posting
    return this.jobsService.getApplicants(jobId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update application status' })
  @Patch('applications/:id/status')
  updateApplicationStatus(
    @Request() req: any,
    @Param('id') applicationId: string,
    @Body('status') status: string,
  ) {
    return this.jobsService.updateApplicationStatus(applicationId, status);
  }

  @ApiOperation({ summary: 'Get job by id' })
  @Get(':id')
  getJobById(@Param('id') id: string) {
    return this.jobsService.getJobById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update job posting' })
  @Patch(':id')
  updateJobPosting(
    @Request() req: any,
    @Param('id') jobId: string,
    @Body() data: any,
  ) {
    return this.jobsService.updateJobPosting(req.user.userId, jobId, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete job posting' })
  @Delete(':id')
  deleteJobPosting(
    @Request() req: any,
    @Param('id') jobId: string,
  ) {
    return this.jobsService.deleteJobPosting(req.user.userId, jobId);
  }
}
