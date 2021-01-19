import { Entity, ObjectIdColumn, Column, BeforeInsert } from 'typeorm'
import * as uuid from 'uuid'
import { ByUser } from '@utils'
import * as moment from 'moment'

@Entity('UserHistory')
export class UserHistoryEntity {
	@ObjectIdColumn()
	_id: string

	@Column()
	idUser: string

	@Column()
	content: string

	@Column()
	time: number

	@Column()
	createdBy: ByUser

	@BeforeInsert()
	async b4register() {
		this._id = await uuid.v4()
		this.time = this.time || moment().valueOf()
	}

	constructor(args: Partial<UserHistoryEntity>) {
		Object.assign(this, args)
	}
}
