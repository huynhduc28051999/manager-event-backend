import { Entity, ObjectIdColumn, Column, BeforeInsert } from 'typeorm'
import * as uuid from 'uuid'
import { ByUser } from '@utils'
import * as moment from 'moment'

@Entity('EventHistory')
export class EventHistoryEntity {
	@ObjectIdColumn()
	_id: string

	@Column()
	idEvent: string

	@Column()
	content: string

	@Column()
	time: number

	@Column()
	createdBy: ByUser

	@BeforeInsert()
	async b4register() {
		this._id = this._id || await uuid.v4()
		this.time = this.time || moment().valueOf()
	}

	constructor(args: Partial<EventHistoryEntity>) {
		Object.assign(this, args)
	}
}
