import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ContactService, ContactEvent } from './contact.service';
import { Logger, Inject, forwardRef, Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // adjust in production
  },
})
@Injectable()
export class ContactGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ContactGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(forwardRef(() => ContactService))
    private readonly contactService: ContactService,
  ) {}

  // 🔥 Correct lifecycle method name
  afterInit() {
    this.logger.log('WebSocket Gateway initialized');

    // Subscribe to service events and broadcast to clients
      this.contactService.getEventsSubject().subscribe((event: ContactEvent) => {
        switch (event.type) {
          case 'created':
            this.server.emit('contact:created', event.payload);
            break;

          case 'updated':
            this.server.emit('contact:updated', event.payload);
            break;

          case 'status_changed':
            this.server.emit('contact:status_changed', event.payload);
            break;
        }
      this.logger.log(`Broadcasting event type=${event.type}`);
      this.server.emit('contact:event', event);
    });
  }

  // Correct connection handler
  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // Correct disconnect handler
  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
