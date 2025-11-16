import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/webhooks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class WebhooksController {
  constructor(private readonly svc: WebhooksService) {}

  @Get()
  async list(@Query('page') page = '1', @Query('pageSize') pageSize = '25') {
    const p = parseInt(String(page), 10) || 1;
    const s = parseInt(String(pageSize), 10) || 25;
    return this.svc.listAttempts({ page: p, pageSize: s });
  }

  @Post(':id/retry')
  async retry(@Param('id') id: string) {
    return this.svc.retryAttempt(id);
  }
}
