import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class SupershopService {
  constructor(private prisma: PrismaService) {}

  async getNearbyShops(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.supershop.findMany({
        include: { provider: { select: { businessName: true } } },
        skip,
        take: limit,
      }),
      this.prisma.supershop.count(),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getShopProducts(shopId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { shopId },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where: { shopId } }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProductById(productId: string) {
    return this.prisma.product.findUnique({ where: { id: productId } });
  }

  async placeOrder(customerId: string, shopId: string, items: any[]) {
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return this.prisma.order.create({
      data: {
        customerId,
        shopId,
        totalAmount,
        status: BookingStatus.PENDING,
        orderItems: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            priceAtTime: i.price,
          })),
        },
      },
    });
  }

  async registerShop(userId: string, data: any) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException('Provider profile not found');

    return this.prisma.supershop.create({
      data: {
        providerId: provider.id,
        shopName: data.shopName,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
      },
    });
  }

  async getMyShop(userId: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException('Provider profile not found');
    return this.prisma.supershop.findUnique({
      where: { providerId: provider.id },
    });
  }

  async updateShop(userId: string, data: any) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException('Provider profile not found');
    const shop = await this.prisma.supershop.findUnique({
      where: { providerId: provider.id },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    return this.prisma.supershop.update({
      where: { id: shop.id },
      data: {
        shopName: data.shopName,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
      },
    });
  }

  async addProduct(userId: string, data: any) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException();
    const shop = await this.prisma.supershop.findUnique({
      where: { providerId: provider.id },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    return this.prisma.product.create({
      data: {
        shopId: shop.id,
        name: data.name,
        price: data.price,
        stock: data.stock,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    });
  }

  async getShopOrders(userId: string, page: number = 1, limit: number = 20) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException();
    const shop = await this.prisma.supershop.findUnique({
      where: { providerId: provider.id },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { shopId: shop.id },
        include: {
          customer: { select: { name: true, phone: true } },
          orderItems: { include: { product: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { shopId: shop.id } }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCustomerOrders(
    customerId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId },
        include: {
          shop: { select: { shopName: true } },
          orderItems: {
            include: { product: { select: { name: true, imageUrl: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { customerId } }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateOrderStatus(
    orderId: string,
    userId: string,
    status: BookingStatus,
  ) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException();
    const shop = await this.prisma.supershop.findUnique({
      where: { providerId: provider.id },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (order?.shopId !== shop.id)
      throw new UnauthorizedException('Not your order');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async cancelCustomerOrder(orderId: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== customerId)
      throw new UnauthorizedException('Not your order');
    if (order.status !== BookingStatus.PENDING) {
      throw new UnauthorizedException(
        'Cannot cancel order after it has been accepted or processed',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: BookingStatus.CANCELLED },
    });
  }

  async updateProduct(userId: string, productId: string, data: any) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException();
    const shop = await this.prisma.supershop.findUnique({
      where: { providerId: provider.id },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (product?.shopId !== shop.id)
      throw new UnauthorizedException('Not your product');

    return this.prisma.product.update({
      where: { id: productId },
      data,
    });
  }

  async deleteProduct(userId: string, productId: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { userId },
    });
    if (!provider) throw new NotFoundException();
    const shop = await this.prisma.supershop.findUnique({
      where: { providerId: provider.id },
    });
    if (!shop) throw new NotFoundException('Shop not found');

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (product?.shopId !== shop.id)
      throw new UnauthorizedException('Not your product');

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }
}
