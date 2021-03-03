import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { ByUser, EnumEventState } from '@utils'
import * as moment from 'moment'
import { Expose, plainToClass } from 'class-transformer'

@Entity('Event')
export class EventEntity {

	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	name: string

	@Expose()
	@Column()
	idGroup: string

	@Expose()
	@Column()
	avatar: string

	@Expose()
	@Column()
	description: string

	@Expose()
	@Column()
	date: number

	@Expose()
	@Column()
	duration: number

	@Expose()
	@Column()
	endTime: number

	@Expose()
	@Column()
	isActive: boolean

	@Expose()
	@Column()
	isLocked: boolean

	@Expose()
	@Column()
	state: EnumEventState

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

	@Expose()
	@Column()
	verifiedAt: number

	@Expose()
	@Column()
	verifiedBy: ByUser

	constructor(args: Partial<EventEntity>) {
		if(args) {
			Object.assign(
				this,
				plainToClass(EventEntity, args, {
					excludeExtraneousValues: true
				})
			)
			this._id = uuid.v4()
			this.createdAt = this.createdAt || moment().valueOf()
			this.updatedAt = moment().valueOf()
		}
	}
}
