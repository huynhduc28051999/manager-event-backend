import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer
} from '@nestjs/websockets'
import { Logger, UseGuards } from '@nestjs/common'
import { Socket, Server } from 'socket.io'
import { getMongoRepository } from 'typeorm'
import { WsGuard } from 'common/guard/wsAuth.guard'
import { Roles } from '@common'

@WebSocketGateway({ transport: ['websocket'] })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private ws: Server
  private logger: Logger = new Logger('AppGateway')

  afterInit(server: any) {
    this.logger.log('Initialized!')
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnect: ${client.id}`)
  }

  async handleConnection(client: Socket) {
    // try {
      this.logger.log(`Client Connected: ${client.id}`)
  }
  // @SubscribeMessage('msgToSever')
  sendAlet(message: string, data: string[] = [], idUser) {
    // this.users.map(item => {
    //   // Điều kiện nhận thông báo
    //   // 1, không phải người tạo ra thông báo
    //   // 2, có tham gia vào group hoặc event đang nhận thông báo
    //   if(data.some(id => item?.user?.idAlet?.has(id) || false) && idUser !== (item.user?._id || '')) {
    //     const client = this.ws.sockets.connected[item.idClient]
    //     if (client) {
    //       client.emit('msgToSever', { data: { message } })
    //     }
    //   }
    // })
  }
  @UseGuards(WsGuard)
  // @Roles('USER')
  @SubscribeMessage('msgToSever')
  async msgToServer(socket: Socket, data: any) {
    console.log(data)
  }
}
