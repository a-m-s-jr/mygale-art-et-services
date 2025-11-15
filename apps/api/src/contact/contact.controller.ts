import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
  Sse,
} from '@nestjs/common';

import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContactService, ContactEvent } from './contact.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SubmissionStatus } from '@prisma/client';
import { CreateContactDto } from './dto/create-contact.dto';
import { Prisma } from '@prisma/client';

/* ------------------------------
   DTO for Status Update
--------------------------------*/
class UpdateStatusDto {
  @IsEnum(SubmissionStatus)
  status!: SubmissionStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

@Controller('contact-submissions')
export class ContactController {
  constructor(private readonly service: ContactService) {}

  /* --------------------------------------------
    PUBLIC CONTACT FORM
  -------------------------------------------- */
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async submitContact(@Body() body: CreateContactDto) {
    return this.service.createContact(body);
  }

  /* --------------------------------------------
    LIST ALL (ADMIN/STAFF)
  -------------------------------------------- */
  @Get()
  async getAll() {
    return this.service.listContacts();
  }

  /* --------------------------------------------
    GET ONE + HISTORY
  -------------------------------------------- */
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.getContactById(id);
  }

  /* --------------------------------------------
    STATUS UPDATE (ADMIN)
  -------------------------------------------- */
  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id/status')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
    @Req() req: any,
  ) {
    const actorId = req.user?.sub ?? req.user?.id ?? null;
    return this.service.updateStatus(
      id,
      body.status,
      body.assignedToId,
      actorId,
    );
  }

  /* --------------------------------------------
    REALTIME STREAM (SSE)
  -------------------------------------------- */
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.service
      .getEventsSubject()
      .pipe(map((evt: ContactEvent) => ({ data: evt }) as MessageEvent));
  }
}
