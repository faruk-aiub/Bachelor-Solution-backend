import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessService } from './mess.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Mess')
@Controller('api/v1/mess')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MessController {
  constructor(private readonly messService: MessService) {}

  @ApiOperation({ summary: 'Get my mess details' })
  @Get('my-mess')
  getMyMessDetails(@Request() req: any) {
    return this.messService.getUserMessDetails(req.user.userId);
  }

  @ApiOperation({ summary: 'Create mess' })
  @Post('create')
  createMess(
    @Request() req: any,
    @Body('name') name: string,
    @Body('address') address: string,
  ) {
    return this.messService.createMess(name, address, req.user.userId);
  }

  @ApiOperation({ summary: 'Join mess' })
  @Post(':messId/join')
  joinMess(@Request() req: any, @Param('messId') messId: string) {
    return this.messService.joinMess(messId, req.user.userId);
  }

  @ApiOperation({ summary: 'Add meal count' })
  @Post(':messId/meals')
  addMealCount(
    @Param('messId') messId: string,
    @Body('date') date: string,
    @Body('count') count: number,
  ) {
    return this.messService.addMealCount(messId, new Date(date), count);
  }

  @ApiOperation({ summary: 'Add expense' })
  @Post(':messId/expenses')
  addExpense(
    @Param('messId') messId: string,
    @Body('amount') amount: number,
    @Body('description') description: string,
  ) {
    return this.messService.addExpense(messId, amount, description);
  }

  @ApiOperation({ summary: 'Get mess ledger' })
  @Get(':messId/ledger')
  getMessLedger(@Param('messId') messId: string) {
    return this.messService.calculateMessLedger(messId);
  }

  @ApiOperation({ summary: 'Get all meals' })
  @Get(':messId/meals')
  getMeals(@Param('messId') messId: string) {
    return this.messService.getMeals(messId);
  }

  @ApiOperation({ summary: 'Get all expenses' })
  @Get(':messId/expenses')
  getExpenses(@Param('messId') messId: string) {
    return this.messService.getExpenses(messId);
  }

  @ApiOperation({ summary: 'Get mess by id' })
  @Get(':id')
  getMessById(@Param('id') id: string) {
    return this.messService.getMessById(id);
  }

  @ApiOperation({ summary: 'Update mess details' })
  @Patch(':id')
  updateMess(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.messService.updateMess(req.user.userId, id, data);
  }

  @ApiOperation({ summary: 'Delete mess' })
  @Delete(':id')
  deleteMess(@Request() req: any, @Param('id') id: string) {
    return this.messService.deleteMess(req.user.userId, id);
  }

  @ApiOperation({ summary: 'Leave mess' })
  @Delete('leave')
  leaveMess(@Request() req: any) {
    return this.messService.leaveMess(req.user.userId);
  }

  @ApiOperation({ summary: 'Remove member' })
  @Delete('member/:memberId')
  removeMember(@Request() req: any, @Param('memberId') memberId: string) {
    return this.messService.removeMember(req.user.userId, memberId);
  }

  @ApiOperation({ summary: 'Delete meal' })
  @Delete('meals/:id')
  deleteMeal(@Request() req: any, @Param('id') mealId: string) {
    return this.messService.deleteMeal(req.user.userId, mealId);
  }

  @ApiOperation({ summary: 'Delete expense' })
  @Delete('expenses/:id')
  deleteExpense(@Request() req: any, @Param('id') expenseId: string) {
    return this.messService.deleteExpense(req.user.userId, expenseId);
  }
}
