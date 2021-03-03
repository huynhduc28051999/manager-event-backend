import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import * as moment from 'moment'
import { Expose, plainToClass } from 'class-transformer'

@Entity('Feedback')
export class FeedbackEntity {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	idEvent: string

	@Expose()
	@Column()
	idUser: string

	@Expose()
	@Column()
	content: string

	@Expose()
	@Column()
	createdAt: number

	constructor(args: Partial<FeedbackEntity>) {
		if(args) {
			Object.assign(
				this,
				plainToClass(FeedbackEntity, args, {
					excludeExtraneousValues: true
				})
			)
			this._id = uuid.v4()
			this.createdAt = this.createdAt || moment().valueOf()
		}
	}
}
