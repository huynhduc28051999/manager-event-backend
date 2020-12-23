import { MongoClient } from 'mongodb'
import * as moment from 'moment'

async function main() {
	console.log('🌱  Database seeder is running')

  const userName = 'tranvu14'
  const password = 'F.U.baby1412'
	const dbName = 'teambuilding'

	const url = `mongodb+srv://${userName}:${password}@cluster0-sudrv.mongodb.net/${dbName}?retryWrites=true&w=majority`
	console.log(`🔗  MONGO_URL: ${url}`)

	const client = new MongoClient(url, {
		useNewUrlParser: true
	})

	try {
		await client.connect()
		console.log('🚀  Server ready')

		const db = client.db(dbName)

		const users = [
			{
				_id: 'c30c0730-be4f-11e9-9f04-f72d443f7ef2',
				email: 'admin',
        name: 'admin',
				role: '0',
				password: '$2b$10$LBWSyma8eNmRYUZi7VUYHef.OeGT2u46nFMKO86Akkmw7jdoE98De',
			},
			{
				_id: 'cb66691e-161e-4a0f-a3fc-6af347903e87',
				email: 'testadd@gmail.com',
				name: 'testadd',
				password: '$2b$10$71Y/3aVMxfVpUJ6fob/KEugdaOq9tQCxuSCibdgKDy0tUGiNt5/J6',
				role: '0',
				idGroup: '1',
				createdBy: {
					_id: 'c30c0730-be4f-11e9-9f04-f72d443f7ef2',
					name: 'admin'
				}
			}
		]
		users.map(async item => {
			await db.collection('User').findOneAndUpdate(
				{ _id: item._id },
				{
					$setOnInsert: {
						_id: item._id
					},
					$set: {
						email: item.email,
						name: item.name,
						isActive: true,
						isLocked: false,
						password: item.password,
						role: item.role,
						idGroup: item.idGroup,
						createdAt: moment().valueOf(),
						createdBy: item.createdBy,
						updatedAt: moment().valueOf()
					}
				},
				{ upsert: true }
			)
		})

		const permissions = [
			{
				_id: '0',
				code: 'ADMIN',
				description: 'Admin'
			},
			{
				_id: '2',
				code: 'MANAGER',
				description: 'Người quản lí'
			},
			{
				_id: '1',
				code: 'USER',
				description: 'Người dùng'
			}
		]

		permissions.map(async item => {
			await db.collection('Permission').findOneAndUpdate(
				{ _id: item._id },
				{
					$setOnInsert: {
						_id: item._id
					},
					$set: {
						code: item.code,
						description: item.description,
						createdAt: moment().valueOf(),
						updatedAt: moment().valueOf()
					}
				},
				{ upsert: true }
			)
		})

		const groups = [
			{
				_id: '1',
				name: 'testGroup',
				avatar: '',
				description: 'group nay de test cho vui',
				createdBy: {
					_id: 'c30c0730-be4f-11e9-9f04-f72d443f7ef2',
					name: 'admin'
				}
			}
		]
		groups.map(async item => {
			await db.collection('Group').findOneAndUpdate(
				{ _id: item._id },
				{
					$setOnInsert: {
						_id: item._id
					},
					$set: {
						name: item.name,
						description: item.description,
						avatar: item.avatar,
						isActive: true,
						createdAt: moment().valueOf(),
						createdBy: item.createdBy,
						updatedAt: moment().valueOf()
					}
				},
				{ upsert: true }
			)
		})
		
		// users: [{
		// 	idUser: 'cb66691e-161e-4a0f-a3fc-6af347903e87',
		// 	state: 'APPROVED'
		// }],
		const events = [
			{
				_id: '1',
				name: 'test event',
				idGroup: '1',
				description: 'noi dung test event',
				state: 'PROCESSING',
				createdBy: {
					_id: 'c30c0730-be4f-11e9-9f04-f72d443f7ef2',
					name: 'admin'
				}
			}
		]
		events.map(async item => {
			await db.collection('Event').findOneAndUpdate(
				{ _id: item._id },
				{
					$setOnInsert: {
						_id: item._id
					},
					$set: {
						name: item.name,
						description: item.description,
						idGroup: item.idGroup,
						isActive: true,
						isLocked: false,
						state: item.state,
						createdAt: moment().valueOf(),
						createdBy: item.createdBy,
						updatedAt: moment().valueOf()
					}
				},
				{ upsert: true }
			)
		})
		const userEvent = [
			{
				_id: '1',
				idEvent: '1',
				idUser: 'cb66691e-161e-4a0f-a3fc-6af347903e87',
				state: 'APPROVED',
				createdBy: {
					_id: 'c30c0730-be4f-11e9-9f04-f72d443f7ef2',
					name: 'admin'
				}
			}
		]
		userEvent.map(async item => {
			await db.collection('UserEvent').findOneAndUpdate(
				{ _id: item._id },
				{
					$setOnInsert: {
						_id: item._id
					},
					$set: {
						...item,
						createdAt: moment().valueOf(),
						createdBy: item.createdBy,
						updatedAt: moment().valueOf()
					}
				},
				{ upsert: true }
			)
		})
		client.close()
		console.log('💤  Server off')
	} catch (err) {
		console.log('❌  Server error', err.stack)
	}
}

main()
