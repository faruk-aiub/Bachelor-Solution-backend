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
}
