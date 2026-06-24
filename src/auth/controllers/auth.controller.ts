import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { LoginRequestDto } from '../dtos/requests/login.request.dto';
import { RegisterRequestDto } from '../dtos/requests/register.request.dto';
import { TokenResponseDto } from '../dtos/responses/token.response.dto';
import { AuthService } from '../services/auth.service';

import type { IUserValidated } from '../interfaces/jwt.interface';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new account' })
  @ApiResponse({ status: HttpStatus.CREATED, type: TokenResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already registered' })
  async register(@Body() dto: RegisterRequestDto): Promise<TokenResponseDto> {
    return this.authService.register(dto);
  }

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
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: HttpStatus.OK, type: TokenResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid refresh token' })
  async refresh(@CurrentUser() user: IUserValidated): Promise<TokenResponseDto> {
    return this.authService.refresh(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Successfully logged out' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async logout(@CurrentUser() user: IUserValidated): Promise<void> {
    await this.authService.logout(user.id);
  }
}
