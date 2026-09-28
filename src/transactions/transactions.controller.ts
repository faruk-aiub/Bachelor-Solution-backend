import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Transactions')
@Controller('api/v1/transactions')
@ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Get transactions' })
  @Get()
  getTransactions(@Request() req: any) {
    return this.transactionsService.getUserTransactions(req.user.userId);
  }

  @ApiOperation({ summary: 'Get all transactions (Admin)' })
  @Get('all')
  getAllTransactions() {
    return this.transactionsService.getAllTransactions();
  }

  @ApiOperation({ summary: 'Initiate payment' })
  @Post('initiate')
  initiatePayment(
    @Request() req: any,
    @Body('amount') amount: number,
    @Body('purpose') purpose: string,
    @Body('gateway') gateway?: string,
  ) {
    return this.transactionsService.initiatePayment(req.user.userId, amount, purpose, gateway);
  }

  @ApiOperation({ summary: 'Update payment status (Webhook)' })
  @Patch(':trxId/status')
  updatePaymentStatus(
    @Param('trxId') trxId: string,
    @Body('status') status: any,
  ) {
    return this.transactionsService.updatePaymentStatus(trxId, status);
  }
}
