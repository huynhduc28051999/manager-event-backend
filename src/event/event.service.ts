import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { getMongoRepository } from 'typeorm'
import { EventEntity, UserEntity, GroupsEntity, FeedbackEntity, UserEventEntity, EventHistoryEntity } from '@entity'
import * as moment from 'moment'
import { AddEventDTO, EnumEventState, EnumUserEventState, EnumUserEventVote, UpdateEventDTO } from '@utils'
import { AppGateway } from 'shared/app.gateway'

@Injectable()
export class EventService {
  constructor (
    private readonly appGateway: AppGateway
  ) {}
  async getAllEvent() {
    try {
      const events = await getMongoRepository(EventEntity).find({
        where: {
          isActive: true
        },
        order: {
          createdAt: 'DESC'
        }
      })
      const [
        userMap,
        groupMap
      ] = await Promise.all<
        Map<string, UserEntity>,
        Map<string, GroupsEntity>
      > ([
        new Promise(async rel => {
          const users = await getMongoRepository(UserEntity).find({ })
          const userMap = new Map(users.map(item => {
            delete item.password
            return [item._id, item]
          }))
          rel(userMap)
        }),
        new Promise(async rel => {
          const groups = await getMongoRepository(GroupsEntity).find({ })
          const groupMap = new Map(groups.map(item => [item._id, item]))
          rel(groupMap)
        })
      ])
      for (const item of events) {
        const [
          feedbackCount,
          likeCount,
          dislikeCount,
          userOfEvent
        ] = await Promise.all<
          number,
          number,
          number,
          any
        >([
          getMongoRepository(FeedbackEntity).count({
            idEvent: item._id
          }),
          getMongoRepository(UserEventEntity).count({
            idEvent: item._id,
            typeVote: EnumUserEventVote.LIKE
          }),
          getMongoRepository(UserEventEntity).count({
            idEvent: item._id,
            typeVote: EnumUserEventVote.DISLIKE
          }),
          getMongoRepository(UserEventEntity).find({
            idEvent: item._id
          })
        ])
          const users = userOfEvent.map(item => userMap.get(item.idUser))
          item['users'] = users
        item['feedbackCount'] = feedbackCount
        item['likeCount'] = likeCount
        item['dislikeCount'] = dislikeCount
        item['group'] = groupMap.get(item.idGroup)
      }
      return events
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async getEventById(_id: string, idUser: string = null) {
    try {
      const event = await getMongoRepository(EventEntity).findOne({ _id })
      if (!event) throw new HttpException('Event not found', HttpStatus.NOT_FOUND)
      const userEvents = await getMongoRepository(UserEventEntity).find({ idEvent: _id })
      const [
        users,
        group,
        feedbacks,
        likeCount,
        dislikeCount,
        vote
      ] = await Promise.all<
        UserEntity[],
        GroupsEntity,
        FeedbackEntity[],
        number,
        number,
        any
      >([
        getMongoRepository(UserEntity).find({
          where: {
            _id: {
              $in: userEvents
                .filter(item => item.state !== EnumUserEventState.CANCELLED)
                .map(item => item.idUser)
            }
          }
        }),
        getMongoRepository(GroupsEntity).findOne({
          _id: event.idGroup
        }),
        getMongoRepository(FeedbackEntity).find({
          idEvent: _id
        }),
        getMongoRepository(UserEventEntity).count({
          idEvent: _id,
          typeVote: EnumUserEventVote.LIKE
        }),
        getMongoRepository(UserEventEntity).count({
          idEvent: _id,
          typeVote: EnumUserEventVote.DISLIKE
        }),
        getMongoRepository(UserEventEntity).findOne({
          idEvent: _id,
          idUser,
          typeVote: EnumUserEventVote.DISLIKE,
          state: EnumUserEventState.APPROVED
        })
      ])
      if (vote) {
        event['voteOfMe'] = vote
      }
      const userMap = new Map()
      users.forEach(item => {
        delete item.password
        userMap.set(item._id, item)
      })
      event['group'] = group
      event['dislikeCount'] = dislikeCount
      event['likeCount'] = likeCount
      event['users'] = users
      event['feedbacks'] = feedbacks.map(item => {
        item['user'] = userMap.get(item.idUser)
        return item
      })
      return event
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async lockAndUnlockEvent(_id: string, { _id: idUser, name }) {
    try {
      const event = await getMongoRepository(EventEntity).findOne({
        _id,
        isActive: true
      })
      if (!event) throw new HttpException('Event not found', HttpStatus.NOT_FOUND)
      event.isLocked = !event.isLocked
      event.updatedAt = moment().valueOf()
      event.updatedBy = {
        _id: idUser,
        name
      }
      const saveEvent = await getMongoRepository(EventEntity).save(event)
      await getMongoRepository(EventHistoryEntity).insertOne(new EventHistoryEntity({
        idEvent: _id,
        content: `${name} đã ${event.isLocked ? 'Mở Khóa' : 'Khóa'} sự kiện ${event.name}`,
        time: moment().valueOf(),
        createdBy: {
          _id: idUser,
          name
        }
      }))
      // this.appGateway.sendAlet
      return saveEvent
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async addEvent(input: AddEventDTO, {_id, name }) {
    try {
      const { idsUser = [] } = input
      const eventExist = await getMongoRepository(EventEntity).findOne({
        name: input.name,
        isActive: true,
        idGroup: input.idGroup
      })
      if (eventExist) throw new HttpException('Event has already exist', HttpStatus.CONFLICT)
      delete input.idsUser
      const newEvent = new EventEntity({
        ...input,
        isActive: true,
        isLocked: false,
        state: EnumEventState.PROCESSING,
        createdAt: moment().valueOf(),
        createdBy: {
          _id,
          name
        }
      })
      const saveEvent = await getMongoRepository(EventEntity).save(newEvent)
      const arrNewUserEvent = idsUser.map(item => new UserEventEntity({
        idEvent: saveEvent._id,
        idUser: item,
        state: EnumUserEventState.APPROVED
      }))
      await getMongoRepository(UserEventEntity).insertMany(arrNewUserEvent)
      await getMongoRepository(EventHistoryEntity).insertOne(new EventHistoryEntity({
        idEvent: _id,
        content: `${name} đã tạo sự kiện ${newEvent.name}`,
        time: moment().valueOf(),
        createdBy: {
          _id,
          name
        }
      }))
      return saveEvent
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async updateEvent(_id: string, input: UpdateEventDTO, {_id: idUser, name }) {
    try {
      const eventExist = await getMongoRepository(EventEntity).findOne({
        where: {
          name: input.name,
          isActive: true,
          idGroup: input.idGroup,
          _id: { $ne: _id }
        }
      })
      if (eventExist) throw new HttpException('Event has already exist', HttpStatus.CONFLICT)
      const updatedEvent = await getMongoRepository(EventEntity).findOneAndUpdate(
        { _id },
        {
          $set: {
            ...input,
            updatedAt: moment().valueOf(),
            updatedBy: {
              _id: idUser,
              name
            }
          }
        }
      )
      await getMongoRepository(EventHistoryEntity).insertOne(new EventHistoryEntity({
        idEvent: _id,
        content: `${name} đã thay đổi thông tin sự kiện ${updatedEvent.value.name}`,
        time: moment().valueOf(),
        createdBy: {
          _id: idUser,
          name
        }
      }))
      return updatedEvent.value
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async deleteEvent(ids: string[], {_id, name }) {
    try {
      const deleted = await getMongoRepository(EventEntity).updateMany(
        { _id: { $in: ids }},
        {
          $set: {
            isActive: false,
            updatedAt: moment().valueOf(),
            updatedBy: {
              _id,
              name
            }
          }
        }
      )
      for (const id of ids) {
        await getMongoRepository(EventHistoryEntity).insertOne(new EventHistoryEntity({
          idEvent: id,
          content: `${name} đã xóa sự kiện này`,
          time: moment().valueOf(),
          createdBy: {
            _id,
            name
          }
        }))
      }
      return !!deleted.result.ok
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async completeEvent(_id: string, { _id: idUser, name }) {
    try {
      const event = await getMongoRepository(EventEntity).findOne({
        _id,
        isActive: true
      })
      if (!event) throw new HttpException('Event not found', HttpStatus.NOT_FOUND)
      if (event.state === EnumEventState.COMPLETED)
        throw new HttpException('Event has already completed', HttpStatus.NOT_FOUND)
      event.state = EnumEventState.COMPLETED
      event.verifiedAt = moment().valueOf()
      event.verifiedBy = {
        _id: idUser,
        name
      }
      const saveEvent = await getMongoRepository(EventEntity).save(event)
      await getMongoRepository(EventHistoryEntity).insertOne(new EventHistoryEntity({
        idEvent: _id,
        content: `${name} đã thay đổi trạng thái sự kiện thành Đã hoàn thành`,
        time: moment().valueOf(),
        createdBy: {
          _id: idUser,
          name
        }
      }))
      return saveEvent
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async cancelEvent(_id: string, {_id: idUser, name }) {
    try {
      const event = await getMongoRepository(EventEntity).findOne({
        _id,
        isActive: true
      })
      if (!event) throw new HttpException('Event not found', HttpStatus.NOT_FOUND)
      if (event.state === EnumEventState.CANCELLED)
        throw new HttpException('Event has already cancelled', HttpStatus.NOT_FOUND)
      event.state = EnumEventState.CANCELLED
      event.updatedAt = moment().valueOf()
      event.updatedBy = {
        _id: idUser,
        name
      }
      const saveEvent = await getMongoRepository(EventEntity).save(event)
      
      await getMongoRepository(EventHistoryEntity).insertOne(new EventHistoryEntity({
        idEvent: _id,
        content: `${name} đã hủy sự kiện này`,
        time: moment().valueOf(),
        createdBy: {
          _id: idUser,
          name
        }
      }))
      return saveEvent
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async addUserToEvent(_id: string, idUser: string, { _id: idUserUpdate, name }) {
    try {
      const event = await getMongoRepository(EventEntity).findOne({ _id })
      if (!event) throw new HttpException('Event not found', HttpStatus.NOT_FOUND)
      const userEventExist = await getMongoRepository(UserEventEntity).findOne({
        idUser,
        idEvent: _id,
        state: EnumUserEventState.APPROVED
      })
      if (userEventExist)
        throw new HttpException('User has already joined this event', HttpStatus.CONFLICT)
      const userEventUnApproved = await getMongoRepository(UserEventEntity).findOne({
        where: {
          idEvent: _id,
          idUser,
          state: EnumUserEventState.REQUESTED
        }
      })
      if (userEventUnApproved) {
        const updated = await getMongoRepository(UserEventEntity).updateOne(
          { _id: userEventUnApproved._id },
          {
            $set: {
              state: EnumUserEventState.APPROVED,
              updatedAt: moment().valueOf(),
              updatedBy: {
                _id: idUserUpdate,
                name
              }
            }
          }
        )
        return !!updated.result.ok
      }
      const saveUserEvent = await getMongoRepository(UserEventEntity).save(new UserEventEntity({
        idEvent: _id,
        idUser,
        state: EnumUserEventState.APPROVED,
        createdAt: moment().valueOf(),
        createdBy: {
          _id: idUserUpdate,
          name
        }
      }))
      const user = await getMongoRepository(UserEntity).findOne({ _id: idUser })
      await getMongoRepository(EventHistoryEntity).insertOne(new EventHistoryEntity({
        idEvent: _id,
        content: `${name} đã thêm ${user.name} vào sự kiện ${event.name}`,
        time: moment().valueOf(),
        createdBy: {
          _id: idUserUpdate,
          name
        }
      }))
      return !!saveUserEvent
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async removeUserFromEvent(_id: string, idUser: string, { _id: idUserUpdate, name }) {
    try {
      const event = await getMongoRepository(EventEntity).findOne({ _id })
      if (!event) throw new HttpException('Event not found', HttpStatus.NOT_FOUND)
      const userEventExist = await getMongoRepository(UserEventEntity).findOne({
        where: {
          idEvent: _id,
          idUser,
          state: EnumUserEventState.APPROVED
        }
      })
      if (!userEventExist)
        throw new HttpException('User was not joined this event', HttpStatus.CONFLICT)
      userEventExist.state = EnumUserEventState.CANCELLED
      userEventExist.updatedAt = moment().valueOf()
      userEventExist.updatedBy = {
        _id: idUserUpdate,
        name
      }
      const saveUserEvent = await getMongoRepository(UserEventEntity).save(userEventExist)
      const user = await getMongoRepository(UserEntity).findOne({ _id: idUser })
      await getMongoRepository(EventHistoryEntity).insertOne(new EventHistoryEntity({
        idEvent: _id,
        content: `${name} đã xóa ${user.name} khỏi sự kiện ${event.name}`,
        time: moment().valueOf(),
        createdBy: {
          _id: idUserUpdate,
          name
        }
      }))
      return !!saveUserEvent
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async approveUserRequest(idUser: string, idEvent: string, { _id: idUserUpdate, name }) {
    try {
      const event = await getMongoRepository(EventEntity).findOne({ _id: idEvent })
      if (!event) throw new HttpException('Event not found', HttpStatus.NOT_FOUND)
      const userEventExist = await getMongoRepository(UserEventEntity).findOne({
        where: {
          idEvent,
          idUser,
          state: EnumUserEventState.APPROVED
        }
      })
      if (userEventExist)
        throw new HttpException('User was joined this event', HttpStatus.CONFLICT)
      const userEventRequested = await getMongoRepository(UserEventEntity).findOne({
        where: {
          idEvent,
          idUser,
          state: EnumUserEventState.REQUESTED
        }
      })
      if (!userEventRequested)
        throw new HttpException('User haven\' requested to join this event', HttpStatus.CONFLICT)
      userEventRequested.state = EnumUserEventState.APPROVED
      userEventRequested.updatedAt = moment().valueOf()
      userEventRequested.updatedBy = {
        _id: idUserUpdate,
        name
      }
      const saveUserEvent = await getMongoRepository(UserEventEntity).save(userEventRequested)
      const user = await getMongoRepository(UserEntity).findOne({ _id: idUser })
      await getMongoRepository(EventHistoryEntity).insertOne(new EventHistoryEntity({
        idEvent,
        content: `${name} đã chấp nhận ${user.name} tham gia sự kiện ${event.name}`,
        time: moment().valueOf(),
        createdBy: {
          _id: idUserUpdate,
          name
        }
      }))
      return !!saveUserEvent
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async paginationEvent(idGroup: string = null, currentPage: number = 1, pageSize: number = 20) {
    try {
      const conditon: any = {
        isActive: true
      }
      if (idGroup) {
        conditon.idGroup = idGroup
      }
      const events = await getMongoRepository(EventEntity).find({
        where: conditon,
        order: {
          createdAt: 'DESC'
        },
        skip: (currentPage - 1) * pageSize,
        take: pageSize
      })
      const [
        userMap,
        groupMap
      ] = await Promise.all<
        Map<string, UserEntity>,
        Map<string, GroupsEntity>
      > ([
        new Promise(async rel => {
          const users = await getMongoRepository(UserEntity).find({ })
          const userMap = new Map(users.map(item => {
            delete item.password
            return [item._id, item]
          }))
          rel(userMap)
        }),
        new Promise(async rel => {
          const groups = await getMongoRepository(GroupsEntity).find({ })
          const groupMap = new Map(groups.map(item => [item._id, item]))
          rel(groupMap)
        })
      ])
      for (const item of events) {
        const [
          feedbackCount,
          likeCount,
          dislikeCount,
          userOfEvent
        ] = await Promise.all<
          number,
          number,
          number,
          any
        >([
          getMongoRepository(FeedbackEntity).count({
            idEvent: item._id
          }),
          getMongoRepository(UserEventEntity).count({
            idEvent: item._id,
            typeVote: EnumUserEventVote.LIKE
          }),
          getMongoRepository(UserEventEntity).count({
            idEvent: item._id,
            typeVote: EnumUserEventVote.DISLIKE
          }),
          getMongoRepository(UserEventEntity).find({
            idEvent: item._id
          })
        ])
          const users = userOfEvent.map(item => userMap.get(item.idUser))
          item['users'] = users
        item['feedbackCount'] = feedbackCount
        item['likeCount'] = likeCount
        item['dislikeCount'] = dislikeCount
        item['group'] = groupMap.get(item.idGroup)
      }
      return events
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async getEventByGroup(idGroup: string) {
    try {
      const events = await getMongoRepository(EventEntity).find({
        where: {
          idGroup,
          isActive: true
        },
        order: {
          isLocked: "DESC",
          createdAt: 'DESC'
        }
      })
      for (const item of events) {
        const [likeCount, dislikeCount] = await Promise.all<number, number> ([
          getMongoRepository(UserEventEntity).count({
            idEvent: item._id,
            typeVote: EnumUserEventVote.LIKE
          }),
          getMongoRepository(UserEventEntity).count({
            idEvent: item._id,
            typeVote: EnumUserEventVote.DISLIKE
          })
        ])
        item['likeCount'] = likeCount
        item['dislikeCount'] = dislikeCount
      }
      return events
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async getEventByUserId(idUser: string) {
    try {
      const useEvent = await getMongoRepository(UserEventEntity).find({
        where: {
          idUser,
          state: EnumUserEventState.APPROVED
        }
      })
      const events = await getMongoRepository(EventEntity).find({
        where: {
          _id: { $in: useEvent.map(item => item.idEvent) },
          isActive: true
        },
        order: {
          isLocked: 'DESC',
          createdAt: 'DESC'
        }
      })
      for (const item of events) {
        const [likeCount, dislikeCount] = await Promise.all<number, number> ([
          getMongoRepository(UserEventEntity).count({
            idEvent: item._id,
            typeVote: EnumUserEventVote.LIKE
          }),
          getMongoRepository(UserEventEntity).count({
            idEvent: item._id,
            typeVote: EnumUserEventVote.DISLIKE
          })
        ])
        item['likeCount'] = likeCount
        item['dislikeCount'] = dislikeCount
      }
      return events
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
