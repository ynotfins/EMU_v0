/**
 * Get Current User Use Case
 * 
 * Retrieves the current authenticated user from session.
 * Used by middleware and components to check auth state.
 */

import { injectable, inject } from 'inversify';
import { UseCase } from '@application/shared/interfaces/use-case.interface';
import { Either, left, right } from '@domain/shared/errors';
import { UserId } from '@domain/shared/value-objects';
import type { IUserRepository } from '@domain/repositories';
import { UserNotFoundError } from '@domain/entities/user/user.errors';
import { TOKENS } from '@infrastructure/di/tokens';
import { GetCurrentUserRequest, GetCurrentUserResponse } from './get-current-user.dto';
import { 
  SessionError,
  toApplicationError 
} from '@application/shared/errors/application.error';
import type { ISessionService } from '@application/shared/interfaces/services.interface';

@injectable()
export class GetCurrentUserUseCase extends UseCase<GetCurrentUserRequest, GetCurrentUserResponse> {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.SessionService) private sessionService: ISessionService
  ) {
    super();
  }

  async execute(request: GetCurrentUserRequest): Promise<Either<Error, GetCurrentUserResponse>> {
    try {
      // 1. Determine user ID from request
      let userIdString: string;

      if (request.userId) {
        // Direct user ID provided
        userIdString = request.userId;
      } else if (request.sessionToken) {
        // Verify session token
        const verifyResult = await this.sessionService.verifySessionToken(request.sessionToken);
        if (verifyResult.isLeft()) {
          return left(new SessionError('Invalid or expired session token'));
        }
        userIdString = verifyResult.value;
      } else {
        return left(new SessionError('No authentication provided'));
      }

      // 2. Create UserId value object
      const userIdResult = UserId.fromString(userIdString);
      if (userIdResult.isLeft()) {
        return left(userIdResult.value);
      }
      const userId = userIdResult.value;

      // 3. Get user from repository
      const userResult = await this.userRepository.findById(userId as UserId);
      if (userResult.isLeft()) {
        return left(toApplicationError(userResult.value));
      }

      const user = userResult.value;
      if (!user) {
        return left(new UserNotFoundError(userId.value));
      }

      // 4. Get permissions based on role
      const permissions = user.role.getPermissions().map(p => p.toString());

      // 5. Return user data
      return right({
        userId: user.id.value,
        email: user.email.value,
        displayName: user.displayName,
        role: user.role.value,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        lastLogin: user.lastLogin?.toISOString(),
        settings: {
          notificationsEnabled: user.settings.notificationsEnabled ?? true,
          soundEnabled: user.settings.soundEnabled ?? true,
          locationSharingEnabled: user.settings.locationSharingEnabled ?? true,
          maxResponseDistance: user.settings.maxResponseDistance,
          autoAcceptIncidents: user.settings.autoAcceptIncidents,
        },
        permissions,
      });
    } catch (error) {
      return left(toApplicationError(error as Error));
    }
  }
}
