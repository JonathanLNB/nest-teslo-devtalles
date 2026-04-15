import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, CreateUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testPrivateRoute() {
    return {
      ok: true,
      message: 'Private route',
    };
  }
}
