import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ContactModule } from './contact/contact.module';
import { AuthModule } from './auth/auth.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { RateLimiterMiddleware } from './common/rate-limiter.middleware';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ContactModule,
    AuthModule,
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
  
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RateLimiterMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // apply globally (middleware itself checks paths)
  }
}