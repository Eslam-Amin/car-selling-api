import {
  UseInterceptors,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';

interface ClassConstructor {
  new (...args: any[]): {};
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Run something before a request is handled by the request handler

    return next.handle().pipe(
      map((data: any) => {
        // Run something before the response is sent out
        return {
          message: data?.message,
          pagination: data?.pagination,
          data: plainToClass(this.dto, data?.data, {
            excludeExtraneousValues: true,
          }),
          other: data.other,
        };
      }),
    );
  }
}
