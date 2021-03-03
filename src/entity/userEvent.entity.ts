import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { EnumUserEventVote, EnumUserEventState, ByUser } from '@utils'
import * as moment from 'moment'
import { Expose, plainToClass } from 'class-transformer'

@Entity('UserEvent')
export class UserEventEntity {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	idUser: string

	@Expose()
	@Column()
	idEvent: string

	@Expose()
	@Column()
  typeVote: EnumUserEventVote

	@Expose()
	@Column()
	state: EnumUserEventState

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

	constructor(args: Partial<UserEventEntity>) {
		if(args) {
			Object.assign(
				this,
				plainToClass(UserEventEntity, args, {
					excludeExtraneousValues: true
				})
			)
			this._id = uuid.v4()
			this.createdAt = this.createdAt || moment().valueOf()
			this.updatedAt = moment().valueOf()
		}
	}
}
