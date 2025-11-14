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
  status!: SubmissionStatus;

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
    const contact = await this.contactService.createContact(body);
    return contact;
  }

  // Admin / staff view
  @Get()
  async getAll(): Promise<ContactSubmission[]> {
    const contacts = await this.contactService.listContacts();
    return contacts;
  }

  // Get one submission
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<ContactSubmission | null> {
    const contact = await this.contactService.getContactById(id);
    return contact;
  }

  // Admin action: update status or assignment
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
  ): Promise<ContactSubmission> {
    const updatedContact = await this.contactService.updateStatus(
      id,
      body.status,
      body.assignedToId,
    );
    return updatedContact;
  }
}
