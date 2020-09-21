import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller'
import { FeedbackService } from './feedback.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FeedbackEntity } from '@entity'
import { SharedModule } from 'shared/shared.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([FeedbackEntity]),
    SharedModule
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService]
})
export class FeedbackModule {}
