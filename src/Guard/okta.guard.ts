import {
  Injectable,
  CanActivate,
  ExecutionContext,
  OnModuleInit,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as OktaJwtVerifier from '@okta/jwt-verifier';

@Injectable()
export class OktaGuard implements CanActivate, OnModuleInit {
  oktaJwtVerifier: any;

  onModuleInit() {
    this.oktaJwtVerifier = new OktaJwtVerifier({
      issuer: process.env.OKTA_ISSUER,
      clientId: process.env.OKTA_CLIENT_ID,
      assertClaims: {
        aud: [process.env.OKTA_AUDIENCE],
      },
    });
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getArgs()[0]?.headers?.authorization) {
      const token = context.getArgs()[0]?.headers?.authorization.split(' ')[1];
      return this.oktaJwtVerifier
        .verifyAsPromise(token)
        .then((jwt) => {
          console.log(jwt);
          return true;
        })
        .catch((error) => {
          console.log(error);
          return false;
        });
    }
    return false;
  }
}
