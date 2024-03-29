import { Injectable, HttpException } from '@nestjs/common';
import * as moment from 'moment'
import { getMongoRepository } from 'typeorm';
import { UserEntity, EventEntity, UserEventEntity } from '@entity';

const mapDataByTimeline = (type, data, timeBy = 'createdAt') => {
  switch (type) {
    case 'MONTH':
      return data.map(item => ({
        ...item,
        name: `Tháng ${moment(item.createdAt).get('month') + 1}`,
        time: moment(item[timeBy]).valueOf()
      }))
    case 'WEEK':
      return data.map(item => ({
        ...item,
        name: `Tuần ${moment(item.createdAt).week()}`,
        time: moment(item[timeBy]).valueOf()
      }))
    default:
      return data.map(item => ({
        ...item,
        name: `${moment(item.createdAt).get('date')}/${moment(item.createdAt).get('month') + 1}`,
        time: moment(item[timeBy]).valueOf()
      }))
  }
}

const getDefaultTimeline = (type, startDate, endDate) => {
  switch (type) {
    case 'MONTH': {
      const start = moment(startDate)
      const end = moment(endDate)
      const arrayDuration = new Array(end.diff(start, 'month')).fill(0)
      if (arrayDuration.length) {
        return arrayDuration.map((_, index) => ({
          name: `Tháng ${moment(startDate)
            .add(index, 'month')
            .get('month') + 1}`,
          time: moment(startDate)
            .add(index, 'month')
            .valueOf()
        }))
      }
      return [
        {
          name: `Tháng ${moment(startDate).month() + 1}`,
          time: moment(startDate).valueOf()
        }
      ]
    }
    case 'WEEK': {
      const start = moment(startDate)
      const end = moment(endDate)
      const arrayDuration = new Array(end.diff(start, 'week')).fill(0)
      if (arrayDuration.length) {
        return arrayDuration.map((_, index) => ({
          name: `Tuần ${moment(startDate)
            .add(index, 'week')
            .week()}`,
          time: moment(startDate)
            .add(index, 'week')
            .valueOf()
        }))
      }
      return [
        {
          name: `Tuần ${moment(startDate).week()}`,
          time: moment(startDate).valueOf()
        }
      ]
    }
    default: {
      const start = moment(startDate)
      const end = moment(endDate)
      const arrayDuration = new Array(end.diff(start, 'day')).fill(0)
      return arrayDuration.map((_, index) => ({
        day: moment(startDate)
          .add(index, 'day')
          .get('date'),
        month:
          moment(startDate)
            .add(index, 'day')
            .get('month') + 1,
        name: `${moment(startDate)
          .add(index, 'day')
          .get('date')}/${moment(startDate)
          .add(index, 'day')
          .get('month') + 1}`,
        time: moment(startDate)
          .add(index, 'day')
          .valueOf()
      }))
    }
  }
}

@Injectable()
export class ReportService {
  async reportUser({
    type,
    dateTime
  }) {
    try {      
      const { startDate } = dateTime
      const endDate =
        moment(dateTime.endDate).valueOf() > moment().valueOf()
          ? moment()
              .add(1, 'day')
              .valueOf()
          : moment(dateTime.endDate)
              .add(1, 'day')
              .valueOf()
      const users = await getMongoRepository(UserEntity).find({
        where: {
          isActive: true,
          createdAt: {
            $gte: moment(startDate).valueOf(),
            $lte: moment(endDate).valueOf()
          }
        }
      })
      const usersByTime = mapDataByTimeline(type, users, 'createdAt')
      const usersMap = new Map()
      usersByTime.forEach(async item => {
        const obj = usersMap.get(item.name) || {
          name: item.name,
          time: item.time,
          value: 0
        }
        usersMap.set(item.name, { ...obj, value: obj.value + 1 })
      })

      const defaultTimeline = getDefaultTimeline(type, startDate, endDate)
      defaultTimeline.forEach(item => {
        const obj = usersMap.get(item.name) || {
          name: item.name,
          time: item.time,
          value: 0
        }
        usersMap.set(item.name, obj)
      })
      const dataLine = JSON.stringify([...usersMap.values()].sort((a, b) => a.time - b.time))
      return {
        dataLine,
        dataGrid: users
      }
    } catch (error) {
      throw new HttpException(error, 500)
    }
  }
  async reportEvent({
    type,
    dateTime
  }) {
    try {      
      const { startDate } = dateTime
      const endDate =
        moment(dateTime.endDate).valueOf() > moment().valueOf()
          ? moment()
              .add(1, 'day')
              .valueOf()
          : moment(dateTime.endDate)
              .add(1, 'day')
              .valueOf()
      const events = await getMongoRepository(EventEntity).find({
        where: {
          isActive: true,
          createdAt: {
            $gte: moment(startDate).valueOf(),
            $lte: moment(endDate).valueOf()
          }
        }
      })
      const eventsByTime = mapDataByTimeline(type, events, 'createdAt')
      const eventsMap = new Map()
      eventsByTime.forEach(async item => {
        const obj = eventsMap.get(item.name) || {
          name: item.name,
          time: item.time,
          COMPLETED: 0,
          PROCESSING: 0,
          CANCELLED: 0
        }
        eventsMap.set(item.name, { ...obj, [`${item.state}`]: obj[item.state] + 1 })
      })

      const defaultTimeline = getDefaultTimeline(type, startDate, endDate)
      defaultTimeline.forEach(item => {
        const obj = eventsMap.get(item.name) || {
          name: item.name,
          time: item.time,
          COMPLETED: 0,
          PROCESSING: 0,
          CANCELLED: 0
        }
        eventsMap.set(item.name, obj)
      })
      const dataLine = JSON.stringify([...eventsMap.values()].sort((a, b) => a.time - b.time))
      return {
        dataLine,
        dataGrid: events
      }
    } catch (error) {
      throw new HttpException(error, 500)
    }
  }
  async reportEventByUser({ dateTime }): Promise<any[] | HttpException> {
    try {
      const { startDate, endDate } = dateTime
      const data = await getMongoRepository(UserEventEntity)
        .aggregate([
          {
            $match: {
              createdAt: {
                $gte: startDate,
                $lte: endDate
              },
              state: 'APPROVED'
            }
          },
          {
            $lookup: {
              from: 'User',
              localField: 'idUser',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: '$user'
          },
          {
            $group: {
              _id: '$user._id',
              count: { $sum: 1 },
              name: { $first: '$user.name' },
              email: { $first: '$user.email' },
              phoneNumber: { $first: '$user.phoneNumber' },
              gender: { $first: '$user.gender' },
              avatar: { $first: '$user.avatar' }
            }
          }
        ])
        .toArray()
      return data
    } catch (error) {
      throw new HttpException(error, 500)
    }
  }

  async detailReportEventByUser({ dateTime, idUser }): Promise<any[] | HttpException> {
    try {
      const { startDate, endDate } = dateTime
      const data = await getMongoRepository(UserEventEntity)
        .aggregate([
          {
            $match: {
              createdAt: {
                $gte: startDate,
                $lte: endDate
              },
              state: 'APPROVED',
              idUser
            }
          },
          {
            $lookup: {
              from: 'Event',
              localField: 'idEvent',
              foreignField: '_id',
              as: 'event'
            }
          },
          {
            $unwind: '$event'
          }
        ])
        .toArray()
      return data
    } catch (error) {
      throw new HttpException(error, 500)
    }
  }


}
