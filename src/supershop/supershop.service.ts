import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class SupershopService {
  constructor(private prisma: PrismaService) {}

  async getNearbyShops() {
    return this.prisma.supershop.findMany({
      include: { provider: { select: { businessName: true } } }
    });
  }

  async getShopProducts(shopId: string) {
    return this.prisma.product.findMany({ where: { shopId } });
  }

  async getProductById(productId: string) {
    return this.prisma.product.findUnique({ where: { id: productId } });
  }

  async placeOrder(customerId: string, shopId: string, items: any[]) {
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return this.prisma.order.create({
      data: {
        customerId,
        shopId,
        totalAmount,
        status: BookingStatus.PENDING,
        orderItems: {
          create: items.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            priceAtTime: i.price
          }))
        }
      }
    });
  }

  async registerShop(userId: string, data: any) {
    const provider = await this.prisma.provider.findUnique({ where: { userId } });
    if (!provider) throw new NotFoundException('Provider profile not found');

    return this.prisma.supershop.create({
      data: {
        providerId: provider.id,
        shopName: data.shopName,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
      }
    });
  }

  async addProduct(userId: string, data: any) {
    const provider = await this.prisma.provider.findUnique({ where: { userId } });
    if (!provider) throw new NotFoundException();
    const shop = await this.prisma.supershop.findUnique({ where: { providerId: provider.id } });
    if (!shop) throw new NotFoundException('Shop not found');

    return this.prisma.product.create({
      data: {
        shopId: shop.id,
        name: data.name,
        price: data.price,
        stock: data.stock,
        description: data.description,
        imageUrl: data.imageUrl
      }
    });
  }

  async getShopOrders(userId: string) {
    const provider = await this.prisma.provider.findUnique({ where: { userId } });
    if (!provider) throw new NotFoundException();
    const shop = await this.prisma.supershop.findUnique({ where: { providerId: provider.id } });
    if (!shop) throw new NotFoundException('Shop not found');

    return this.prisma.order.findMany({
      where: { shopId: shop.id },
      include: {
        customer: { select: { name: true, phone: true } },
        orderItems: { include: { product: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateOrderStatus(orderId: string, userId: string, status: BookingStatus) {
    const provider = await this.prisma.provider.findUnique({ where: { userId } });
    if (!provider) throw new NotFoundException();
    const shop = await this.prisma.supershop.findUnique({ where: { providerId: provider.id } });
    if (!shop) throw new NotFoundException('Shop not found');

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (order?.shopId !== shop.id) throw new UnauthorizedException('Not your order');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }
}
