import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { EnumUserEventVote, EnumUserEventState } from '@utils'
import { getMongoRepository } from 'typeorm'
import { UserEventEntity, EventEntity, UserEntity, UserHistoryEntity } from '@entity'
import * as moment from 'moment'

const displayTypevote = (value) => {
  switch (value) {
    case 'LIKE':
      return 'Thích'
    case 'DISLIKE':
      return 'Không thích'
    default:
      return 'Bỏ thích'
  }
}
@Injectable()
export class VoteService {
  async modifyVote(idUser: string, idEvent: string, type: EnumUserEventVote, { name }) {
    try {
      const event = await getMongoRepository(EventEntity).findOne({ _id: idEvent, isActive: true })
      if (!event) throw new HttpException('Event not found or has deleted', HttpStatus.NOT_FOUND)
      const userEventExist = await getMongoRepository(UserEventEntity).findOne({
        idUser,
        idEvent,
        state: EnumUserEventState.APPROVED
      })
      if (!userEventExist)
        throw new HttpException(`You was not joined ${event.name}`, HttpStatus.NOT_FOUND)
      if (userEventExist.typeVote === type) userEventExist.typeVote = EnumUserEventVote.NONE
      else userEventExist.typeVote = type
      const saveVote = await getMongoRepository(UserEventEntity).save(userEventExist)
      await getMongoRepository(UserHistoryEntity).insertOne(new UserHistoryEntity({
        idUser,
        content: `${name} đã ${displayTypevote(type)} sự kiện ${event.name}`,
        time: moment().valueOf(),
        createdBy: {
          _id: idUser,
          name
        }
      }))
      return !!saveVote
    } catch (error) {
      console.log(error)
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async getallVoteByEvent(idEvent: string){
    try {
      const votes = await getMongoRepository(UserEventEntity).find({
        where: {
          idEvent,
          type: { $ne: EnumUserEventVote.NONE }
        },
        order: {
          createdAt: 'DESC'
        }
      })
      const users = await getMongoRepository(UserEntity).find({
        where: {
          _id: { $in: votes.map(item => item.idUser) }
        }
      })
      const usersNameMap = new Map(users.map(item => [item._id, item.name]))
      votes.forEach(item => {
        item['user'] = usersNameMap.get(item._id)
      })
      return votes
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
