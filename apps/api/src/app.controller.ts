import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
//import { PrismaService } from './prisma/prisma.service';
//import { User } from '@prisma/client';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    //private prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /*@Get('users')
  async getUsers(): Promise<User[]> {
    const users: User[] = await this.prisma.user.findMany();
    return users;
  } */
}