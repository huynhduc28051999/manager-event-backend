import { Entity, ObjectIdColumn, Column } from 'typeorm';
import * as uuid from 'uuid'
import { ByUser, EnumGender } from '@utils';
import * as moment from 'moment'
import { Expose, plainToClass } from 'class-transformer'

@Entity('User')
export class UserEntity {
	@Expose()
	@ObjectIdColumn()
	_id: string

	@Expose()
	@Column()
	name: string

	@Expose()
	@Column()
	password: string

	@Expose()
	@Column()
	email: string

	@Expose()
	@Column()
	phoneNumber: string

	@Expose()
	@Column()
	avatar: string

	@Expose()
	@Column()
	idGroup: string

	@Expose()
	@Column()
	birthday: number

	@Expose()
	@Column()
	gender: EnumGender

	@Expose()
	@Column()
	isActive: boolean

	@Expose()
	@Column()
	isLocked: boolean

	@Expose()
	@Column()
	role: string

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

	constructor(args: Partial<UserEntity>) {
		if(args) {
			Object.assign(
				this,
				plainToClass(UserEntity, args, {
					excludeExtraneousValues: true
				})
			)
			this._id = uuid.v4()
			this.createdAt = this.createdAt || moment().valueOf()
			this.updatedAt = moment().valueOf()
		}
	}
}
