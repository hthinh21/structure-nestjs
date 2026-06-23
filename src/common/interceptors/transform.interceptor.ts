import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { map } from 'rxjs/operators';

import type { Observable } from 'rxjs';

export interface IResponse<T> {
  success: boolean;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<IResponse<T>> {
    return next.handle().pipe(map((data: T): IResponse<T> => ({ success: true, data })));
  }
}
