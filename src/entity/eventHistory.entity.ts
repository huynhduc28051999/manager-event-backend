import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { ByUser } from '@utils'
import * as moment from 'moment'
import { Expose, plainToClass } from 'class-transformer'

@Entity('EventHistory')
export class EventHistoryEntity {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	idEvent: string

	@Expose()
	@Column()
	content: string

	@Expose()
	@Column()
	time: number

	@Expose()
	@Column()
	createdBy: ByUser

	constructor(args: Partial<EventHistoryEntity>) {
		if(args) {
			Object.assign(
				this,
				plainToClass(EventHistoryEntity, args, {
					excludeExtraneousValues: true
				})
			)
			this._id = uuid.v4()
			this.time = this.time || moment().valueOf()
		}
	}
}
