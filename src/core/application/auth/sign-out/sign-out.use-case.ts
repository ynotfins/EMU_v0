/**
 * Sign Out Use Case
 * 
 * Handles user sign out by invalidating session.
 */

import { injectable, inject } from 'inversify';
import { UseCase } from '@application/shared/interfaces/use-case.interface';
import { Either, left, right } from '@domain/shared/errors';
import { TOKENS } from '@infrastructure/di/tokens';
import { SignOutRequest, SignOutResponse } from './sign-out.dto';
import { 
  SessionError,
  toApplicationError 
} from '@application/shared/errors/application.error';
import type { ISessionService } from '@application/shared/interfaces/services.interface';

@injectable()
export class SignOutUseCase extends UseCase<SignOutRequest, SignOutResponse> {
  constructor(
    @inject(TOKENS.SessionService) private sessionService: ISessionService
  ) {
    super();
  }

  async execute(request: SignOutRequest): Promise<Either<Error, SignOutResponse>> {
    try {
      // 1. Validate session token exists
      if (!request.sessionToken) {
        return left(new SessionError('No session token provided'));
      }

      // 2. Invalidate the session
      const invalidateResult = await this.sessionService.invalidateSession(
        request.sessionToken
      );
      
      if (invalidateResult.isLeft()) {
        return left(new SessionError('Failed to invalidate session'));
      }

      // 3. Return success
      return right({
        success: true
      });
    } catch (error) {
      return left(toApplicationError(error as Error));
    }
  }
}
