import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AppService } from './app.service';

@ApiTags('Root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get root hello message' })
  @ApiResponse({ status: HttpStatus.OK, type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
