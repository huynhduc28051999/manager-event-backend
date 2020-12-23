import { Module } from '@nestjs/common'
import { VoteController } from './vote.controller'
import { VoteService } from './vote.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEventEntity } from '@entity'

@Module({
  imports: [TypeOrmModule.forFeature([UserEventEntity])],
  controllers: [VoteController],
  providers: [VoteService]
})
export class VoteModule {}
