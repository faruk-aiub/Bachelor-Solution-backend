import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Body, UseGuards, Request, Param } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Support')
@Controller('api/v1/support')
@ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @ApiOperation({ summary: 'Get tickets' })
  @Get()
  getTickets(@Request() req: any) {
    return this.supportService.getUserTickets(req.user.userId);
  }

  @ApiOperation({ summary: 'Create ticket' })
  @Post()
  createTicket(
    @Request() req: any,
    @Body('subject') subject: string,
    @Body('description') description: string,
  ) {
    return this.supportService.createTicket(req.user.userId, subject, description);
  }

  @ApiOperation({ summary: 'Get single ticket' })
  @Get(':id')
  getTicketById(@Param('id') id: string) {
    return this.supportService.getTicketById(id);
  }

  @ApiOperation({ summary: 'Resolve ticket (Admin)' })
  @Patch(':id/resolve')
  resolveTicket(@Param('id') id: string) {
    return this.supportService.resolveTicket(id);
  }

  @ApiOperation({ summary: 'Delete ticket (Admin)' })
  @Delete(':id')
  deleteTicket(@Param('id') id: string) {
    return this.supportService.deleteTicket(id);
  }
}
