import { Controller, UseGuards, Post, Body, Get, Query } from '@nestjs/common'
import { AuthGuard, User, Reponse } from '@common'
import { VoteService } from './vote.service'

@UseGuards(AuthGuard)
@Controller('vote')
export class VoteController {
  constructor(
    private readonly voteService: VoteService
  ) {}
  @Post('modify-vote')
  async modifyVote(@User() user, @Body() { idEvent, type }) {
    // {
    //   idEvent: string
    //   type: enum VoteType
    // }
    const data = await this.voteService.modifyVote(user._id, idEvent, type, { name: user.name })
    return Reponse(data)
  }
  
  @Get('get-all-vote-by-event')
  async getAllVoteByEvent(@Query('id') idEvent: string) {
    const data = await this.voteService.getallVoteByEvent(idEvent)
    return Reponse(data)
  }
}
