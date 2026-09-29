import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AmbulanceService {
  constructor(private prisma: PrismaService) {}

  // Find nearby available ambulances
  async findNearbyAmbulances(lat: number, lng: number, radiusKm: number = 5) {
    // In production with PostGIS, use ST_DWithin
    return this.prisma.$queryRaw`
      SELECT 
        s.id as "serviceId", s.title, s."basePrice",
        p.id as "providerId", p."businessName", p.phone, p.lat, p.lng
      FROM "Service" s
      JOIN "Provider" p ON s."providerId" = p.id
      WHERE s.category = 'AMBULANCE' 
      AND s."isActive" = true
      AND p.lat IS NOT NULL 
      AND p.lng IS NOT NULL
    `;
  }

  // Request an ambulance directly from home
  async requestEmergencyAmbulance(customerId: string, serviceId: string, lat: number, lng: number, address: string) {
    // Fetch the service to get base price
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      throw new NotFoundException('Ambulance service not found');
    }

    // Create a high-priority booking
    return this.prisma.booking.create({
      data: {
        customerId,
        serviceId,
        lat,
        lng,
        address,
        totalAmount: service.basePrice || 0,
        status: 'PENDING',
        problemDetails: 'EMERGENCY_AMBULANCE_REQUEST'
      },
      include: {
        service: {
          include: { provider: true }
        }
      }
    });
  }

  async getAmbulanceById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id, category: 'AMBULANCE' },
      include: {
        provider: {
          include: {
            reviews: true,
            user: { select: { name: true, phone: true } }
          }
        }
      }
    });
    if (!service) {
      throw new NotFoundException('Ambulance service not found');
    }
    return service;
  }

  async getMyAmbulanceRequests(customerId: string) {
    return this.prisma.booking.findMany({
      where: {
        customerId,
        service: { category: 'AMBULANCE' }
      },
      include: {
        service: { include: { provider: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
