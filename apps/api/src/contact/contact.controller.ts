import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactSubmission, SubmissionStatus } from '@prisma/client';

class UpdateStatusDto {
  @IsEnum(SubmissionStatus)
  status: SubmissionStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

@Controller('contact-submissions')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Public endpoint used by the website form
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async submitContact(
    @Body() body: CreateContactDto,
  ): Promise<ContactSubmission> {
    return this.contactService.createContact(body);
  }

  // Admin / staff view
  @Get()
  async getAll(): Promise<ContactSubmission[]> {
    return this.contactService.listContacts();
  }

  // Get one submission + full audit history
  @Get(':id')
  async getOneWithHistory(
    @Param('id') id: string,
  ): Promise<ContactSubmission & { auditLogs: any[] }> {
    return this.contactService.getContactWithHistory(id);
  }

  // Admin action: update status or assignment
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
  ): Promise<ContactSubmission> {
    return this.contactService.updateStatus(id, body.status, body.assignedToId);
  }
}
