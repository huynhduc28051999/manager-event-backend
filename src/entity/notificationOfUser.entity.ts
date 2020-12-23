import { Entity, ObjectIdColumn, Column, BeforeInsert } from 'typeorm'
import * as uuid from 'uuid'
import { ByUser } from '@utils'
import * as moment from 'moment'

@Entity('NotificationOfUser')
export class NotificationOfUserEntity {
	@ObjectIdColumn()
	_id: string

	@Column()
	idUser: string

	@Column()
	content: string

	@Column()
	isRead: boolean

	@Column()
	createdAt: number

	@Column()
	createdBy: ByUser

	@Column()
	updatedAt: number

	@Column()
	updatedBy: ByUser

	@BeforeInsert()
	async b4register() {
    this._id = this._id || await uuid.v4()
    this.createdAt = this.createdAt || moment().valueOf()
    this.updatedAt = moment().valueOf()
	}

	constructor(args: Partial<NotificationOfUserEntity>) {
		Object.assign(this, args)
	}
}
