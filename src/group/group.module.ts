import { Module } from '@nestjs/common'
import { GroupController } from './group.controller'
import { GroupService } from './group.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GroupsEntity } from '@entity'
import { SharedModule } from 'shared/shared.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupsEntity]),
    SharedModule
  ],
  controllers: [GroupController],
  providers: [GroupService]
})
export class GroupModule {}
