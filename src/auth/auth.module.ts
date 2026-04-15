import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    //Configuración asíncrona
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const jwtSecret = configService.get('JWT_SECRET') ?? 'Prueba';
        const jwtLifetime = configService.get('JWT_LIFETIME') ?? '2h';
        console.log('JWT Secret Process', jwtSecret);
        console.log('JWT Secret ConfigModule', process.env.JWT_SECRET);

        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: jwtLifetime,
          },
        };
      },
    }),

    /* Configuración síncrona
     JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_LIFETIME! as any,
      },
    }),
     */
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
