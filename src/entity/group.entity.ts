import { Entity, ObjectIdColumn, Column } from 'typeorm'
import * as uuid from 'uuid'
import { ByUser } from '@utils'
import * as moment from 'moment'
import { Expose, plainToClass } from 'class-transformer'

@Entity('Group')
export class GroupsEntity {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	name: string

	@Expose()
	@Column()
	avatar: string

	@Expose()
	@Column()
	title: string

	@Expose()
	@Column()
	background: string

	@Expose()
	@Column()
	description: string

	@Expose()
	@Column()
	isActive: boolean

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

	constructor(args: Partial<GroupsEntity>) {
		if(args) {
			Object.assign(
				this,
				plainToClass(GroupsEntity, args, {
					excludeExtraneousValues: true
				})
			)
			this._id = uuid.v4()
			this.createdAt = this.createdAt || moment().valueOf()
			this.updatedAt = moment().valueOf()
		}
	}
}
