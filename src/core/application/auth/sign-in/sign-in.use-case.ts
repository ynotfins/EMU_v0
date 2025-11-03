/**
 * Sign In Use Case
 * 
 * Handles user authentication with email/password or Google.
 * Following the pattern from best_practices_our_stack.txt:
 * - Client gets ID token
 * - Server verifies token and creates session
 */

import { injectable, inject } from 'inversify';
import { UseCase } from '@application/shared/interfaces/use-case.interface';
import { Either, left, right } from '@domain/shared/errors';
import { Email, Role } from '@domain/shared/value-objects';
import { IUserRepository } from '@domain/repositories';
import { 
  InvalidUserCredentialsError, 
  UserNotActiveError,
  EmailNotVerifiedError 
} from '@domain/entities/user/user.errors';
import { TOKENS } from '@infrastructure/di/tokens';
import { 
  SignInWithEmailRequest, 
  SignInWithGoogleRequest, 
  SignInResponse 
} from './sign-in.dto';
import { ApplicationError, ExternalServiceError, toApplicationError } from '@application/shared/errors/application.error';
import { IAuthService } from '@application/shared/interfaces/services.interface';

@injectable()
export class SignInWithEmailUseCase extends UseCase<SignInWithEmailRequest, SignInResponse> {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.AuthService) private authService: IAuthService
  ) {
    super();
  }

  async execute(request: SignInWithEmailRequest): Promise<Either<Error, SignInResponse>> {
    try {
      // 1. Validate email format
      const emailResult = Email.create(request.email);
      if (emailResult.isLeft()) {
        return left(emailResult.value);
      }
      const email = emailResult.value;

      // 2. Verify credentials with Firebase Auth
      const authResult = await this.authService.verifyEmailPassword(
        email.value,
        request.password
      );
      if (authResult.isLeft()) {
        return left(new InvalidUserCredentialsError());
      }

      // 3. Get user from repository
      const userResult = await this.userRepository.findByEmail(email);
      if (userResult.isLeft()) {
        return left(toApplicationError(userResult.value));
      }

      const user = userResult.value;
      if (!user) {
        return left(new InvalidUserCredentialsError());
      }

      // 4. Check if user is active
      if (!user.isActive()) {
        return left(new UserNotActiveError(user.id.value, user.status));
      }

      // 5. Check if email is verified (configurable requirement)
      if (!user.emailVerified) {
        return left(new EmailNotVerifiedError(user.id.value));
      }

      // 6. Create session token
      const sessionResult = await this.authService.createSessionToken(user.id.value);
      if (sessionResult.isLeft()) {
        return left(new ExternalServiceError('Auth', 'createSessionToken', sessionResult.value));
      }

      // 7. Update last login
      user.recordLogin();
      await this.userRepository.save(user);

      // 8. Return success response
      return right({
        userId: user.id.value,
        email: user.email.value,
        displayName: user.displayName,
        role: user.role.value,
        emailVerified: user.emailVerified,
        sessionToken: sessionResult.value,
      });
    } catch (error) {
      return left(toApplicationError(error as Error));
    }
  }
}

@injectable()
export class SignInWithGoogleUseCase extends UseCase<SignInWithGoogleRequest, SignInResponse> {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.AuthService) private authService: IAuthService
  ) {
    super();
  }

  async execute(request: SignInWithGoogleRequest): Promise<Either<Error, SignInResponse>> {
    try {
      // 1. Verify Google ID token
      const verifyResult = await this.authService.verifyGoogleIdToken(request.idToken);
      if (verifyResult.isLeft()) {
        return left(new ExternalServiceError('GoogleAuth', 'verifyIdToken', verifyResult.value));
      }

      const { email: emailStr, uid } = verifyResult.value;

      // 2. Create Email value object
      const emailResult = Email.create(emailStr);
      if (emailResult.isLeft()) {
        return left(emailResult.value);
      }
      const email = emailResult.value;

      // 3. Find or create user
      const userResult = await this.userRepository.findByEmail(email);
      if (userResult.isLeft()) {
        return left(toApplicationError(userResult.value));
      }

      let user = userResult.value;

      // 4. If user doesn't exist, create them
      if (!user) {
        // In a real app, you might want to create the user here
        // For now, we'll return an error
        return left(new ApplicationError(
          'User not found. Please sign up first.',
          'USER_NOT_FOUND'
        ));
      }

      // 5. Check if user is active
      if (!user.isActive()) {
        return left(new UserNotActiveError(user.id.value, user.status));
      }

      // 6. Mark email as verified (Google accounts are pre-verified)
      if (!user.emailVerified) {
        const verifyResult = user.verifyEmail();
        if (verifyResult.isRight()) {
          await this.userRepository.save(user);
        }
      }

      // 7. Create session token
      const sessionResult = await this.authService.createSessionToken(user.id.value);
      if (sessionResult.isLeft()) {
        return left(new ExternalServiceError('Auth', 'createSessionToken', sessionResult.value));
      }

      // 8. Update last login
      user.recordLogin();
      await this.userRepository.save(user);

      // 9. Return success response
      return right({
        userId: user.id.value,
        email: user.email.value,
        displayName: user.displayName,
        role: user.role.value,
        emailVerified: true, // Google accounts are always verified
        sessionToken: sessionResult.value,
      });
    } catch (error) {
      return left(toApplicationError(error as Error));
    }
  }
}
