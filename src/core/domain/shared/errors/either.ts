/**
 * Either Monad for Error Handling
 * 
 * Represents a value of one of two possible types (a disjoint union).
 * An instance of Either is either an instance of Left or Right.
 * By convention, Left is used for failure and Right is used for success.
 */

export type Either<L, R> = Left<L, R> | Right<L, R>;

export class Left<L, R> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isLeft(): this is Left<L, R> {
    return true;
  }

  isRight(): this is Right<L, R> {
    return false;
  }

  map<T>(_fn: (value: R) => T): Either<L, T> {
    return this as any;
  }

  mapLeft<T>(fn: (value: L) => T): Either<T, R> {
    return new Left(fn(this.value));
  }

  flatMap<T>(_fn: (value: R) => Either<L, T>): Either<L, T> {
    return this as any;
  }

  getOrElse(defaultValue: R): R {
    return defaultValue;
  }

  getOrElseThrow(errorMessage?: string): R {
    throw new Error(errorMessage || `Cannot get right value from Left: ${this.value}`);
  }

  fold<T>(onLeft: (value: L) => T, _onRight: (value: R) => T): T {
    return onLeft(this.value);
  }
}

export class Right<L, R> {
  readonly value: R;

  constructor(value: R) {
    this.value = value;
  }

  isLeft(): this is Left<L, R> {
    return false;
  }

  isRight(): this is Right<L, R> {
    return true;
  }

  map<T>(fn: (value: R) => T): Either<L, T> {
    return new Right(fn(this.value));
  }

  mapLeft<T>(_fn: (value: L) => T): Either<T, R> {
    return this as any;
  }

  flatMap<T>(fn: (value: R) => Either<L, T>): Either<L, T> {
    return fn(this.value);
  }

  getOrElse(_defaultValue: R): R {
    return this.value;
  }

  getOrElseThrow(_errorMessage?: string): R {
    return this.value;
  }

  fold<T>(_onLeft: (value: L) => T, onRight: (value: R) => T): T {
    return onRight(this.value);
  }
}

// Helper functions
export const left = <L, R>(value: L): Either<L, R> => new Left(value);
export const right = <L, R>(value: R): Either<L, R> => new Right(value);

// Type guards
export const isLeft = <L, R>(value: Either<L, R>): value is Left<L, R> => value.isLeft();
export const isRight = <L, R>(value: Either<L, R>): value is Right<L, R> => value.isRight();
