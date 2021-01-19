import { Entity, ObjectIdColumn, Column, BeforeInsert } from 'typeorm'
import * as uuid from 'uuid'
import { EnumUserEventVote, EnumUserEventState, ByUser } from '@utils'
import * as moment from 'moment'

@Entity('UserEvent')
export class UserEventEntity {
	@ObjectIdColumn()
	_id: string

	@Column()
	idUser: string

	@Column()
	idEvent: string

	@Column()
  typeVote: EnumUserEventVote

  @Column()
	state: EnumUserEventState

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
		this._id = await uuid.v4()
    this.createdAt = this.createdAt || moment().valueOf()
	}

	constructor(args: Partial<UserEventEntity>) {
		Object.assign(this, args)
	}
}
