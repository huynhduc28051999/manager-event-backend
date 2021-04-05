import { Module } from '@nestjs/common'
import { AppGateway } from './app.gateway'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationOfUserEntity } from '@entity'
@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationOfUserEntity])
  ],
  providers: [AppGateway],
  exports: [AppGateway]
})
export class SharedModule {
}
