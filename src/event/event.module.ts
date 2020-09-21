import { Module } from '@nestjs/common'
import { EventController } from './event.controller'
import { EventService } from './event.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EventEntity } from '@entity'
import { AppGateway } from 'shared/app.gateway'
import { SharedModule } from 'shared/shared.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity]),
    SharedModule
  ],
  controllers: [EventController],
  providers: [EventService]
})
export class EventModule {}
