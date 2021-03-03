import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { join } from 'path'
import { PermissionModule } from './permission/permission.module'
import { GroupModule } from './group/group.module'
import { EventModule } from './event/event.module'
import { FeedbackModule } from './feedback/feedback.module'
import { VoteModule } from './vote/vote.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    TypeOrmModule.forRoot(
        {
          // url: 'mongodb+srv://huynhduc:duc123456789@cluster0.pvxto.mongodb.net/eventmanage',
          url: 'mongodb://localhost:27017/eventmanage',
          type: "mongodb",
          entities: [join(__dirname, '**/**.entity{.ts,.js}')],
          synchronize: true,
          useNewUrlParser: true,
          logging: true,
          useUnifiedTopology: true
        }
    ),
    PermissionModule,
    GroupModule,
    EventModule,
    FeedbackModule,
    VoteModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
