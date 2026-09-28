import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessService {
  constructor(private prisma: PrismaService) {}

  async createMess(name: string, address: string, managerId: string) {
    const mess = await this.prisma.mess.create({
      data: { name, address }
    });
    // Add manager as first member
    await this.prisma.messMember.create({
      data: {
        userId: managerId,
        messId: mess.id,
        isManager: true
      }
    });
    return mess;
  }

  async updateMess(userId: string, messId: string, data: any) {
    const member = await this.prisma.messMember.findUnique({ where: { userId } });
    if (!member || member.messId !== messId) throw new UnauthorizedException('You are not in this mess');
    if (!member.isManager) throw new UnauthorizedException('Only manager can update mess details');

    return this.prisma.mess.update({
      where: { id: messId },
      data
    });
  }

  async deleteMess(userId: string, messId: string) {
    const member = await this.prisma.messMember.findUnique({ where: { userId } });
    if (!member || member.messId !== messId) throw new UnauthorizedException('You are not in this mess');
    if (!member.isManager) throw new UnauthorizedException('Only manager can delete mess');

    // First delete all related records
    await this.prisma.meal.deleteMany({ where: { messId } });
    await this.prisma.messExpense.deleteMany({ where: { messId } });
    await this.prisma.messMember.deleteMany({ where: { messId } });
    
    // Then delete the mess
    return this.prisma.mess.delete({ where: { id: messId } });
  }

  async joinMess(messId: string, userId: string) {
    return this.prisma.messMember.create({
      data: { userId, messId }
    });
  }

  async getUserMessDetails(userId: string) {
    const membership = await this.prisma.messMember.findUnique({
      where: { userId },
      include: {
        mess: {
          include: {
            members: { include: { user: { select: { name: true, phone: true } } } },
            expenses: { orderBy: { date: 'desc' }, take: 10 },
            meals: { orderBy: { date: 'desc' }, take: 7 }
          }
        }
      }
    });
    if (!membership) throw new NotFoundException('You are not in any mess.');
    return membership;
  }

  async addMealCount(messId: string, date: Date, count: number) {
    return this.prisma.meal.create({
      data: { messId, date, totalCount: count }
    });
  }

  async addExpense(messId: string, amount: number, description: string) {
    return this.prisma.messExpense.create({
      data: { messId, amount, description }
    });
  }

  async calculateMessLedger(messId: string) {
    const expenses = await this.prisma.messExpense.findMany({ where: { messId } });
    const meals = await this.prisma.meal.findMany({ where: { messId } });

    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalMeals = meals.reduce((sum, meal) => sum + meal.totalCount, 0);

    const mealRate = totalMeals > 0 ? (totalExpense / totalMeals) : 0;

    return {
      totalExpense,
      totalMeals,
      mealRate: mealRate.toFixed(2),
      status: "Calculated successfully"
    };
  }

  async getMessById(id: string) {
    return this.prisma.mess.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { name: true, phone: true } } } }
      }
    });
  }

  async leaveMess(userId: string) {
    const member = await this.prisma.messMember.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('You are not in a mess');
    if (member.isManager) throw new BadRequestException('Manager cannot leave, transfer role first');
    return this.prisma.messMember.delete({ where: { userId } });
  }

  async removeMember(userId: string, memberIdToRemove: string) {
    const manager = await this.prisma.messMember.findUnique({ where: { userId } });
    if (!manager || !manager.isManager) throw new UnauthorizedException('Only manager can remove members');
    
    const memberToRemove = await this.prisma.messMember.findUnique({ where: { id: memberIdToRemove } });
    if (!memberToRemove || memberToRemove.messId !== manager.messId) throw new NotFoundException('Member not found in your mess');
    
    return this.prisma.messMember.delete({ where: { id: memberIdToRemove } });
  }

  async deleteMeal(userId: string, mealId: string) {
    const member = await this.prisma.messMember.findUnique({ where: { userId } });
    if (!member) throw new UnauthorizedException('You are not in a mess');

    const meal = await this.prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal || meal.messId !== member.messId) throw new NotFoundException('Meal not found');

    return this.prisma.meal.delete({ where: { id: mealId } });
  }

  async deleteExpense(userId: string, expenseId: string) {
    const member = await this.prisma.messMember.findUnique({ where: { userId } });
    if (!member) throw new UnauthorizedException('You are not in a mess');

    const expense = await this.prisma.messExpense.findUnique({ where: { id: expenseId } });
    if (!expense || expense.messId !== member.messId) throw new NotFoundException('Expense not found');

    return this.prisma.messExpense.delete({ where: { id: expenseId } });
  }
}
