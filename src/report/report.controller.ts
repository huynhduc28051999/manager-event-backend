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
  @Get('reportEventByUser')
  async reportEventByUser(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const data = await this.reportService.reportEventByUser({
      dateTime: {
        startDate: Number(startDate),
        endDate: Number(endDate)
      }
    })
    return Reponse(data)
  }
  @Get('detail-user-event')
  async detailUserEvent(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('idUser') idUser: string
  ) {
    const data = await this.reportService.detailReportEventByUser({
      dateTime: {
        startDate: Number(startDate),
        endDate: Number(endDate)
      },
      idUser
    })
    return Reponse(data)
  }
}
