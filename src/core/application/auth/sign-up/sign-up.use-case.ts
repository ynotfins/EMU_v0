/**
 * Sign Up Use Case
 * 
 * Handles new user registration.
 * Creates user in both Firebase Auth and our domain.
 */

import { injectable, inject } from 'inversify';
import { UseCase } from '@application/shared/interfaces/use-case.interface';
import { Either, left, right } from '@domain/shared/errors';
import { Email, Role } from '@domain/shared/value-objects';
import { User } from '@domain/entities/user/user.entity';
import type { IUserRepository } from '@domain/repositories';
import { UserAlreadyExistsError } from '@domain/entities/user/user.errors';
import { TOKENS } from '@infrastructure/di/tokens';
import { SignUpRequest, SignUpResponse } from './sign-up.dto';
import { 
  ApplicationError, 
  ExternalServiceError,
  UseCaseError,
  toApplicationError 
} from '@application/shared/errors/application.error';
import type { 
  IAuthService, 
  IEmailService 
} from '@application/shared/interfaces/services.interface';
import { logger } from '@/lib/utils/logger';

@injectable()
export class SignUpUseCase extends UseCase<SignUpRequest, SignUpResponse> {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.AuthService) private authService: IAuthService,
    @inject(TOKENS.EmailService) private emailService: IEmailService
  ) {
    super();
  }

  async execute(request: SignUpRequest): Promise<Either<Error, SignUpResponse>> {
    try {
      // 1. Validate and create value objects
      const emailResult = Email.create(request.email);
      if (emailResult.isLeft()) {
        return left(emailResult.value);
      }
      const email = emailResult.value;

      const roleResult = Role.create(request.role || 'chaser');
      if (roleResult.isLeft()) {
        return left(roleResult.value);
      }
      const role = roleResult.value;

      // 2. Check if user already exists
      const existingUserResult = await this.userRepository.existsByEmail(email);
      if (existingUserResult.isLeft()) {
        return left(toApplicationError(existingUserResult.value));
      }

      if (existingUserResult.value) {
        return left(new UserAlreadyExistsError(email.value));
      }

      // 3. Create user in Firebase Auth
      const authResult = await this.authService.createUserWithEmailPassword(
        email.value,
        request.password
      );
      if (authResult.isLeft()) {
        return left(new ExternalServiceError(
          'Auth', 
          'createUserWithEmailPassword', 
          authResult.value
        ));
      }

      const firebaseUid = authResult.value;

      // 4. Create domain user entity
      const userResult = User.create({
        email,
        displayName: request.displayName,
        role,
        phoneNumber: request.phoneNumber,
      });

      if (userResult.isLeft()) {
        // If domain creation fails, we should ideally clean up Firebase Auth
        // For now, we'll just return the error
        return left(userResult.value);
      }

      const user = userResult.value;

      // 5. Save user to repository
      const saveResult = await this.userRepository.save(user);
      if (saveResult.isLeft()) {
        return left(toApplicationError(saveResult.value));
      }

      // 6. Send verification email
      let verificationEmailSent = false;
      const verificationResult = await this.authService.sendEmailVerification(email.value);
      if (verificationResult.isRight()) {
        verificationEmailSent = true;
      } else {
        // Log error but don't fail the signup
        logger.error('Failed to send verification email', verificationResult.value as Error, {
          code: 'SignUpUseCase',
          email: email.value,
        });
      }

      // 7. Send welcome email (non-blocking)
      this.emailService.sendWelcomeEmail(email.value, user.displayName)
        .then(result => {
          if (result.isLeft()) {
            logger.error('Failed to send welcome email', result.value as Error, {
              code: 'SignUpUseCase',
              email: email.value,
            });
          }
        })
        .catch((error) => {
          logger.error('Error in welcome email promise', error as Error, {
            code: 'SignUpUseCase',
            email: email.value,
          });
        });

      // 8. Return success response
      return right({
        userId: user.id.value,
        email: user.email.value,
        displayName: user.displayName,
        role: user.role.value,
        emailVerified: false,
        verificationEmailSent,
      });
    } catch (error) {
      return left(toApplicationError(error as Error));
    }
  }

  /**
   * Validates password strength
   * Can be customized based on requirements
   */
  private validatePassword(password: string): Either<Error, void> {
    if (password.length < 8) {
      return left(new UseCaseError(
        'SignUp',
        'Password must be at least 8 characters long'
      ));
    }

    // Additional checks can be added:
    // - Must contain uppercase
    // - Must contain lowercase  
    // - Must contain number
    // - Must contain special character

    return right(undefined);
  }
}
