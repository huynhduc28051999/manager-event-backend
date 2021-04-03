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
import { NotificationOfUserEntity, UserEventEntity } from '@entity'
import { EnumUserEventState } from '@utils'
import * as moment from 'moment'

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private ws: Server
  private logger: Logger = new Logger('AppGateway')

  afterInit(server: any) {
    this.logger.log('Initialized!')
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnect: ${client.id}`)
    client.leaveAll()
  }

  async handleConnection(client: Socket) {
      this.logger.log(`Client Connected: ${client.id}`)
  }

  async sendAlet(message: string, idEvent: string, { _id, name }) {
    const userOfEvent = await getMongoRepository(UserEventEntity).find({
      where: {
        idUser: { $ne: _id },
        idEvent,
        state: EnumUserEventState.APPROVED
      }
    })
    const dataRes = []
    for (const item of userOfEvent) {
      const newNotification = new NotificationOfUserEntity({
        content: message,
        idUser: item.idUser,
        isRead: false,
        createdAt: moment().valueOf(),
        createdBy: {
          _id,
          name
        }
      })
      this.ws.to(item.idUser).emit('notification', newNotification)
      dataRes.push(newNotification)
    }
    await getMongoRepository(NotificationOfUserEntity).insertMany(dataRes)
  }
  sendComment(idEvent: string, data) {
    this.ws.to(idEvent).emit('comment', data)
  }
  @UseGuards(WsGuard)
  @SubscribeMessage('msgToSever')
  async msgToServer(socket: Socket, data: any) {
    console.log(data)
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('addCommment')
  async addComment(socket: Socket, data: any) {
    console.log(data)
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('joinRoom')
  async joinRoom(socket: Socket, data: any) {
    socket.join(data)
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('leaveRoom')
  async leaveRoom(socket: Socket, data: any) {
    socket.leave(data)
  }
  async sendAlertToUser(content, idEvent, idUser, { _id, name }) {
    const newNotification = new NotificationOfUserEntity({
      content,
      idUser: idUser,
      isRead: false,
      createdAt: moment().valueOf(),
      createdBy: {
        _id,
        name
      }
    })
    this.ws.to(idUser).emit('notification', newNotification)
    await getMongoRepository(NotificationOfUserEntity).save(newNotification)
  }
}
