import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { LoginRequestDto } from '../dtos/requests/login.request.dto';
import { TokenResponseDto } from '../dtos/responses/token.response.dto';
import { AuthService } from '../services/auth.service';

import type { IUserValidated } from '../interfaces/jwt.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: HttpStatus.OK, type: TokenResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async login(@Body() dto: LoginRequestDto): Promise<TokenResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Public()
  @UseGuards(AuthGuard(AUTH_CONSTANTS.JWT_REFRESH_STRATEGY))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: HttpStatus.OK, type: TokenResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid refresh token' })
  async refresh(@CurrentUser() user: IUserValidated): Promise<TokenResponseDto> {
    return this.authService.refresh(user);
  }
}
