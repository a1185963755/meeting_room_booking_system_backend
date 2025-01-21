import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

@Injectable()
export class HttpInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // 记录请求日志
    this.logger.log(
      `Request: ${request.method} ${request.url} from ${request.ip}: ${
        context.getClass().name
      } ${context.getHandler().name}`,
    );

    // 计算请求处理时间
    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        // 计算响应时间
        const duration = Date.now() - startTime;
        this.logger.debug(`Response: ${JSON.stringify(data)}`);
        // 统一成功响应格式
        return {
          code: HttpStatus.OK,
          message: 'success',
          data,
          timestamp: new Date(
            new Date().getTime() + 8 * 60 * 60 * 1000,
          ).toISOString(),
          duration: `${duration}ms`,
          path: request.url,
        };
      }),
      catchError((error) => {
        // 记录错误日志
        this.logger.error(
          `Error in ${request.method} ${request.url}: ${error.message}: ${
            context.getClass().name
          } ${context.getHandler().name}`,
          error.stack,
        );

        // 统一错误响应格式
        const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status);

        return of({
          code: status,
          message:
            error?.response?.message ||
            error?.message ||
            'Internal server error',
          data: null,
          timestamp: new Date(
            new Date().getTime() + 8 * 60 * 60 * 1000,
          ).toISOString(),
          duration: `${Date.now() - startTime}ms`,
          path: request.url,
        });
      }),
    );
  }
}
