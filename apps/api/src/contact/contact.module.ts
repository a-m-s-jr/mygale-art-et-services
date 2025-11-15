import { Module, forwardRef } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ContactGateway } from './contact.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [ContactController],
  providers: [ContactService, ContactGateway],
  exports: [ContactService],
})
export class ContactModule {}
