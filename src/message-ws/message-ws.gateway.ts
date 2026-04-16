import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Socket } from 'socket.io';
import { Server } from 'node:net';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const token: string = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messageWsService.registerClient(client, payload.id);
    } catch (e) {
      client.disconnect();
      return;
    }
    this.wss.emit(
      'clients-updated',
      this.messageWsService.getConnectedClient(),
    );
  }

  handleDisconnect(client: Socket) {
    this.messageWsService.handleDisconnected(client.id);
    this.wss.emit(
      'clients-updated',
      this.messageWsService.getConnectedClient(),
    );
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    //! Emitir únicamente al cliente
    /*client.emit('message-from-server', {
      fullName: 'Soy yo!',
      message: payload.message ?? 'Sin mensaje',
    });*/

    //! Emitir a todos MENOS, al cliente inicial
    /*client.broadcast.emit('message-from-server', {
      fullName: 'Soy yo!',
      message: payload.message ?? 'Sin mensaje',
    });*/

    //! Emitir a todos
    this.wss.emit('message-from-server', {
      fullName: this.messageWsService.getUserFullName(client.id),
      message: payload.message ?? 'Sin mensaje',
    });
  }
}
