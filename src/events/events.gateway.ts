import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  
  // Keep track of connected users: { userId: socketId }
  private connectedUsers = new Map<string, string>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client trying to connect: ${client.id}`);
    
    try {
      // Get token from auth header or query param
      const token = client.handshake.auth.token || client.handshake.query.token;
      
      if (!token) {
        this.logger.warn(`Disconnecting client ${client.id} - No token provided`);
        client.disconnect();
        return;
      }

      // Verify token
      const payload = this.jwtService.verify(token as string, {
        secret: process.env.JWT_SECRET || 'bachelor_solution_secret',
      });

      const userId = payload.sub || payload.userId; // adjust based on actual JWT payload
      
      if (userId) {
        this.connectedUsers.set(userId, client.id);
        this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
        
        // Notify the client that they are successfully connected and authenticated
        client.emit('connected', { message: 'Successfully connected to WebSocket server' });
      } else {
        client.disconnect();
      }
    } catch (error) {
      this.logger.error(`Authentication error for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove user from the map when they disconnect
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  // Method to send notification to a specific user
  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('new_notification', notification);
      this.logger.log(`Notification sent to user ${userId} via socket`);
    } else {
      this.logger.log(`User ${userId} is not currently connected to WebSocket`);
    }
  }

  // Example of a client message handler
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: any): string {
    return 'pong';
  }
}
