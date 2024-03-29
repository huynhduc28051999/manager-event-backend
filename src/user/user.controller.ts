import { Controller, Get, Param, Post, Body, UseGuards, Query, Req, Delete, Put } from '@nestjs/common'
import { UserService } from './user.service'
import { AddUserDTO, ADMIN, MANAGER, USER, ChangePasswordDTO, ChangeProfile } from '@utils'
import { AuthGuard, Roles, User, Reponse } from '@common'
import { getMongoRepository } from 'typeorm'
import { NotificationOfUserEntity } from '@entity'

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  async profile(@User() user) {
    const data = await this.userService.getProfile(user._id)
    return Reponse(data)
  }

  @Get('all-event-by-group')
  async allEventByGroup(@User() user) {
    const data = await this.userService.eventsOfGroupByUserId(user._id)
    return Reponse(data)
  }

  @Roles(ADMIN)
  @Post()
  async addUser(@User() user, @Body() addUserDTO: AddUserDTO) {
    const data = await this.userService.addUser(addUserDTO, user)
    return Reponse(data)
  }

  @Roles(ADMIN)
  @Get('get-all-user')
  async getAllUser() {
    const data = await this.userService.getAllUser()
    return Reponse(data)
  }

  @Roles(ADMIN)
  @Get()
  async userById(@Query('id') idUser) {
    const data = await this.userService.getUserById(idUser)
    return Reponse(data)
  }

  @Roles(ADMIN)
  @Post('delete-user')
  async deleteUsers(@User() user, @Body() { ids }) {
    // {
    //   ids: []
    // }
    const data = await this.userService.deletedUser(ids, user)
    return Reponse(data)
  }

  @Roles(ADMIN)
  @Put()
  async update(@User() user, @Body() { _id, input }) {
    // {
    //   _id: string,
    //   input: {}
    // }
    const data = await this.userService.updateUser(_id, input, user)
    return Reponse(data)
  }

  @Roles(ADMIN)
  @Post('lock-and-unlock-user')
  async lockAndUnlockUser(@User() user, @Body() { _id }) {
    // {
    //   _id: string
    // }
    const data = await this.userService.lockAndUnlockUser(_id, user)
    return Reponse(data)
  }

  @Roles(ADMIN, MANAGER)
  @Post('search-user')
  async searchUser(@Body() { keyword, searchBy = 'all' }){
    const data = await this.userService.searchUser(keyword, searchBy)
    return Reponse(data)
  }

  @Post('request-join-event')
  async requestJoinEvent(@User() user, @Body() { idEvent }) {
    // {
    //   idEvent: string
    // }
    const data = await this.userService.requestJoinEvent(user._id, idEvent, user)
    return Reponse(data)
  }

  @Post('change-password')
  async changePassword(@User('_id') _id, @Body() input: ChangePasswordDTO) {
    const data = await this.userService.changePassword(_id, input)
    return Reponse(data)
  }
  
  @Post('change-profile')
  async changeProfile(@User() user, @Body() input: ChangeProfile) {
    const data = await this.userService.updateUser(user._id, input, user)
    return Reponse(data)
  }
  @Get('notification')
  async notification(@User('_id') _id) {
    const data = await getMongoRepository(NotificationOfUserEntity).find({ idUser: _id, isRead: false })
    return Reponse(data)
  }
  @Delete('make-read-all')
  async makeReadAll(@User('_id') _id) {
    const data = await getMongoRepository(NotificationOfUserEntity).updateMany({ idUser: _id, isRead: false }, { $set: { isRead: true } })
    return Reponse(data.result.ok)
  }
  @Delete('make-read')
  async readNotify(@User('_id') _id, @Body('id') id) {
    const data = await getMongoRepository(NotificationOfUserEntity).updateOne({ _id: id }, { $set: { isRead: true } })
    return Reponse(data.result.ok)
  }
}

