 
 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: (req: { headers: { authorization: any } }) => {
        // From Authorization header: Bearer <token>
        const auth = req?.headers?.authorization;
        if (!auth) return null;
        const [, token] = auth.split(' ');
        return token;
      },
      // use public key
      secretOrKey: process.env.JWT_PUBLIC_KEY,
      algorithms: ['RS256'],
      audience: process.env.JWT_AUD || 'api',
      issuer: process.env.JWT_ISSUER || 'mygale',
      passReqToCallback: false,
    } as any);
  }

  validate(payload: any) {
    // payload.sub, payload.role, payload.email
    // return a user object attached to request.user
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role ?? 'VIEWER',
    };
  }
}
