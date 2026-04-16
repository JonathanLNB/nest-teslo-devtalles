import {
  Body,
  Controller,
  Get,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/auth.entity';
import { RawHeaders } from '../common/decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { Auth } from './decorators/auth.decorator';

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

  @Get('status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') email: string,
    @RawHeaders() rawHeaders: any,
  ) {
    return {
      ok: true,
      message: 'Private route',
      user,
      email,
      rawHeaders,
    };
  }

  @Get('private2')
  @SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  testPrivateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Private route',
      user,
    };
  }

  @Get('private3')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testPrivateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Private route',
      user,
    };
  }

  @Get('private4')
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  testPrivateRoute4(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Private route',
      user,
    };
  }
}
