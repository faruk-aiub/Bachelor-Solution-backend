import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { SupershopService } from './supershop.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Supershop')
@Controller('api/v1/supershop')
export class SupershopController {
  constructor(private readonly supershopService: SupershopService) {}

  @ApiOperation({ summary: 'Get nearby shops' })
  @Get('nearby')
  getNearbyShops() {
    return this.supershopService.getNearbyShops();
  }

  @ApiOperation({ summary: 'Get products' })
  @Get(':shopId/products')
  getProducts(@Param('shopId') shopId: string) {
    return this.supershopService.getShopProducts(shopId);
  }

  @ApiOperation({ summary: 'Get single product' })
  @Get('product/:id')
  getProductById(@Param('id') productId: string) {
    return this.supershopService.getProductById(productId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Place order' })
  @Post('order')
  placeOrder(
    @Request() req: any,
    @Body('shopId') shopId: string,
    @Body('items') items: any[],
  ) {
    return this.supershopService.placeOrder(req.user.userId, shopId, items);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my orders' })
  @Get('my-orders')
  getMyOrders(@Request() req: any) {
    return this.supershopService.getCustomerOrders(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Register shop' })
  @Post('register')
  registerShop(
    @Request() req: any,
    @Body() data: any,
  ) {
    return this.supershopService.registerShop(req.user.userId, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my shop info' })
  @Get('me')
  getMyShop(@Request() req: any) {
    return this.supershopService.getMyShop(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update shop info' })
  @Patch('me')
  updateShop(
    @Request() req: any,
    @Body() data: any,
  ) {
    return this.supershopService.updateShop(req.user.userId, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add product' })
  @Post('products')
  addProduct(
    @Request() req: any,
    @Body() data: any,
  ) {
    return this.supershopService.addProduct(req.user.userId, data);
  }

  // New endpoints for shop owner
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get shop orders' })
  @Get('orders')
  getShopOrders(@Request() req: any) {
    if (req.user.role !== 'PROVIDER') throw new UnauthorizedException('Only providers can view orders');
    return this.supershopService.getShopOrders(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update order status' })
  @Patch('orders/:id/status')
  updateOrderStatus(
    @Request() req: any,
    @Param('id') orderId: string,
    @Body('status') status: any, // BookingStatus enum
  ) {
    return this.supershopService.updateOrderStatus(orderId, req.user.userId, status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update product' })
  @Patch('products/:id')
  updateProduct(
    @Request() req: any,
    @Param('id') productId: string,
    @Body() data: any,
  ) {
    return this.supershopService.updateProduct(req.user.userId, productId, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete product' })
  @Delete('products/:id')
  deleteProduct(
    @Request() req: any,
    @Param('id') productId: string,
  ) {
    return this.supershopService.deleteProduct(req.user.userId, productId);
  }
}
