import { Controller, UseGuards, Get, Query, Post, Body, Put } from '@nestjs/common'
import { AuthGuard, Roles, Reponse, User } from '@common'
import { ADMIN, MANAGER, AddEventDTO } from '@utils'
import { EventService } from './event.service'

@UseGuards(AuthGuard)
@Controller('event')
export class EventController {
  constructor(
    private readonly eventService: EventService
  ) { }

  @Roles(ADMIN, MANAGER)
  @Get('get-all-event')
  async getAllEvent() {
    const data = await this.eventService.getAllEvent()
    return Reponse(data)
  }

  @Roles(ADMIN, MANAGER)
  @Get()
  async getEventById(@Query('id') id: string) {
    const data = await this.eventService.getEventById(id)
    return Reponse(data)
  }

  @Roles(ADMIN, MANAGER)
  @Get('pagination-event')
  async paginationEvent(@Query() { idGroup = null, currentPage = 1, pageSize = 20 }) {
    const data = await this.eventService.paginationEvent(idGroup, currentPage, pageSize)
    return Reponse(data)
  }

  @Roles(ADMIN)
  @Post('lock-and-unlock-event')
  async lockAndUnlockEvent(@Body() { _id }, @User() user) {
    const data = await this.eventService.lockAndUnlockEvent(_id, user)
    return Reponse(!!data)
  }

  @Roles(MANAGER)
  @Post()
  async addEvent(@Body() input: AddEventDTO, @User() user) {
    const data = await this.eventService.addEvent(input, user)
    return Reponse(!!data)
  }

  @Roles(MANAGER)
  @Put()
  async updateEvent(@Body() { _id, input }, @User() user) {
    const data = await this.eventService.updateEvent(_id, input, user)
    return Reponse(!!data)
  }
  
  @Roles(MANAGER)
  @Post('delete-event')
  async deleteEvent(@Body() { ids = [] }, @User() user) {
    const data = await this.eventService.deleteEvent(ids, user)
    return Reponse(data)
  }

  @Roles(MANAGER)
  @Post('add-user-to-event')
  async addUserToEvent(@Body() { _id, idUser }, @User() user) {
    const data = await this.eventService.addUserToEvent(_id, idUser, user)
    return Reponse(data)
  }

  @Roles(MANAGER)
  @Post('remove-user-from-event')
  async removeUserFromEvent(@Body() { _id, idUser }, @User() user) {
    const data = await this.eventService.removeUserFromEvent(_id, idUser, user)
    return Reponse(data)
  }

  @Roles(MANAGER)
  @Post('complete-event')
  async completeEvent(@Body() { _id }, @User() user) {
    const data = await this.eventService.completeEvent(_id, user)
    return Reponse(data)
  }

  @Roles(MANAGER)
  @Post('cancel-event')
  async cancelEvent(@Body() { _id }, @User() user) {
    const data = await this.eventService.cancelEvent(_id, user)
    return Reponse(data)
  }

  @Roles(MANAGER)
  @Post('approve-user-request')
  async approveUserRequest(@Body() { idUser, idEvent }, @User() user) {
    const data = await this.eventService.approveUserRequest(idUser, idEvent, user)
    return Reponse(data)
  }
  @Get('get-event-by-group')
  async getEventByGroup(@Query('id') id) {
    const data = await this.eventService.getEventByGroup(id)
    return Reponse(data)
  }
  @Get('get-event-by-user')
  async getEventByUser(@Query('id') id) {
    const data = await this.eventService.getEventByUserId(id)
    return Reponse(data)
  }
  @Get('get-event-by-range-date')
  async getEventByRangeDate(
    @Query('startDate') startDate,
    @Query('endDate') endDate
  ) {
    const start = parseFloat(startDate)
    const end = parseFloat(endDate)
    const data = await this.eventService.getEventByRangeDate(start, end)
    return Reponse(data)
  }
  @Get('event-history')
  async getEventHistory(
    @Query('idEvent') idEvent
  ) {
    const data = await this.eventService.getHistoryEvent(idEvent)
    return Reponse(data)
  }
}
