import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { getMongoRepository } from 'typeorm'
import { EventEntity, FeedbackEntity, UserEntity, UserEventEntity, UserHistoryEntity } from '@entity'
import { FeedbackDTO, EnumUserEventState } from '@utils'
import * as moment from 'moment'
import { AppGateway } from 'shared/app.gateway'

@Injectable()
export class FeedbackService {
  constructor (
    private readonly appGateway: AppGateway
  ) {}
  async getFeedbackByEvent(idEvent: string) {
    try {
      const event = await getMongoRepository(EventEntity).findOne({ _id: idEvent, isActive: true })
      if (!event) throw new HttpException('Event not found or has deleted', HttpStatus.NOT_FOUND)
      const feedbacks = await getMongoRepository(FeedbackEntity).find({
        where: {
          idEvent: event._id
        },
        order: {
          createdAt: 'ASC'
        }
      })
      const userMap: Map<string, UserEntity> = await new Promise(async rel => {
        const users = await getMongoRepository(UserEntity).find({
          where: {
            _id: { $in: [...new Set(feedbacks.map(item => item.idUser))] }
          }
        })
        rel(new Map(users.map(item => [item._id, item])))
      })
      return feedbacks.map(item => {
        item['user'] = userMap.get(item.idUser)
        return item
      })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async getAllFeedback() {
    try {
      const [eventMap, feedbacks] = await Promise.all<
        Map<string, EventEntity>,
        FeedbackEntity[]
      >([
        new Promise(async rel => {
          const events = await getMongoRepository(EventEntity).find({
            order: {
              createdAt: 'DESC'
            }
          })
          rel(new Map(events.map(item => [item._id, item])))
        }),
        getMongoRepository(FeedbackEntity).find({})
      ])
      feedbacks.forEach(item => {
        item['event'] = eventMap.get(item.idEvent)
      })
      return feedbacks
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async addFeedback(input: FeedbackDTO, { _id, name, avatar }) {
    try {
      const event = await getMongoRepository(EventEntity).findOne({ _id: input.idEvent, isActive: true })
      if (!event) throw new HttpException('Event not found or has deleted', HttpStatus.NOT_FOUND)
      const userEvent = await getMongoRepository(UserEventEntity).findOne({
        idEvent: input.idEvent,
        idUser: _id,
        state: EnumUserEventState.APPROVED
      })
      if (!userEvent)
        throw new HttpException(`You was not joined ${event.name}`, HttpStatus.NOT_FOUND)
      const newFeedback = new FeedbackEntity({
        ...input,
        idUser: _id
      })
      const inseted = await getMongoRepository(FeedbackEntity).insertOne(newFeedback)
      this.appGateway.sendComment(input.idEvent, { ...newFeedback, user: { _id, name, avatar }})
      await getMongoRepository(UserHistoryEntity).insertOne(new UserHistoryEntity({
        idUser: _id,
        content: `${name} đã bình luận ở sự kiện ${event.name}`,
        time: moment().valueOf(),
        createdBy: {
          _id,
          name
        }
      }))
      this.appGateway.sendAlet(`${name} đã bình luận ở sự kiện ${event.name}`, input.idEvent, { _id, name })
      return !!inseted.result.ok
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
