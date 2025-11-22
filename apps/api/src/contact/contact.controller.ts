/*import {
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
import { ReplySchema, DraftSchema } from './schemas';
import { ZodError } from 'zod';

/* ------------------------------
   DTO for Status Update
--------------------------------*/
/*class UpdateStatusDto {
  @IsEnum(SubmissionStatus)
  status!: SubmissionStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

@Controller('contact-submissions')
export class ContactController {
  constructor(public readonly service: ContactService) {}

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard) // require login to reply
  @Roles('ADMIN', 'STAFF')
  async replyToSubmission(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    // validate with zod
    try {
      const dto = ReplySchema.parse(body);
      const actorId = req.user?.sub ?? req.user?.id ?? null;
      const result = await this.service.sendReply(id, dto, actorId);
      return { success: true, result };
    } catch (err) {
      if (err instanceof ZodError) {
        return { success: false, errors: err };
      }
      // nodemailer or prisma errors
      throw err;
    }
  }

  @Post(':id/draft')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'STAFF')
  async saveDraft(
    @Param('id') id: string,
    @Body() body: { draft: string },
    @Req() req: any,
  ) {
    try {
      const dto = DraftSchema.parse(body);
      const actorId = req.user?.sub ?? req.user?.id ?? null;
      return this.service.saveDraft(id, dto.draft ?? null, actorId);
    } catch (error) {
      if (error instanceof ZodError)
        return { success: false, errors: error };
      throw error;
    }
  }

  @Get(':id/draft')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN', 'STAFF')
  async getDraft(@Param('id') id: string) {
    // get latest draft audit log
    const draft = await this.service.getLatestDraft(id);
    return { draft: draft ?? null };
  }

  /* --------------------------------------------
    PUBLIC CONTACT FORM
  -------------------------------------------- */
 /* @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async submitContact(@Body() body: CreateContactDto) {
    return this.service.createContact(body);
  }

  /* --------------------------------------------
    LIST ALL (ADMIN/STAFF)
  -------------------------------------------- */
 /* @Get()
  async getAll() {
    return this.service.listContacts();
  }

  /* --------------------------------------------
    GET ONE + HISTORY
  -------------------------------------------- */
 /* @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.getContactById(id);
  }

  /* --------------------------------------------
    STATUS UPDATE (ADMIN)
  -------------------------------------------- */
 /* @Put(':id/status')
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
  /*@Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.service
      .getEventsSubject()
      .pipe(map((evt: ContactEvent) => ({ data: evt }) as MessageEvent))
  }
}
*/