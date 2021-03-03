import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { ByUser } from '@utils'
import * as moment from 'moment'
import { Expose, plainToClass } from 'class-transformer'

@Entity('NotificationOfUser')
export class NotificationOfUserEntity {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	idUser: string

	@Expose()
	@Column()
	content: string

	@Expose()
	@Column()
	isRead: boolean

	@Expose()
	@Column()
	createdAt: number

	@Expose()
	@Column()
	createdBy: ByUser

	@Expose()
	@Column()
	updatedAt: number

	@Expose()
	@Column()
	updatedBy: ByUser

	constructor(args: Partial<NotificationOfUserEntity>) {
		if(args) {
			Object.assign(
				this,
				plainToClass(NotificationOfUserEntity, args, {
					excludeExtraneousValues: true
				})
			)
			this._id = uuid.v4()
			this.createdAt = this.createdAt || moment().valueOf()
			this.updatedAt = moment().valueOf()
		}
	}
}
