import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { User } from '../entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException('Token not valid');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'User is inactive, talk with an administrator',
      );
    }
    return user;
  }
}
