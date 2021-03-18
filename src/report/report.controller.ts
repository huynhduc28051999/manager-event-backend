import { Controller, Get, UseGuards, Query } from '@nestjs/common'
import { AuthGuard, Reponse } from '@common'
import { ReportService } from './report.service'

@Controller('report')
@UseGuards(AuthGuard)
export class ReportController {
  constructor (
    private readonly reportService: ReportService
  ) {}
  @Get('reportUser')
  async reportUser(
    @Query('type') type: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const data = await this.reportService.reportUser({
      type,
      dateTime: {
        startDate: Number(startDate),
        endDate: Number(endDate)
      }
    })
    return Reponse(data)
  }
  @Get('reportEvent')
  async reportEvent(
    @Query('type') type: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const data = await this.reportService.reportEvent({
      type,
      dateTime: {
        startDate: Number(startDate),
        endDate: Number(endDate)
      }
    })
    return Reponse(data)
  }
}
