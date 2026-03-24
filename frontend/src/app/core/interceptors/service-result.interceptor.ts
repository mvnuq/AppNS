import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { extractHttpErrorMessage } from '../utils/http-error.util';

/**
 * Los fallos de ServiceResult en el backend se mapean a códigos HTTP (400/404) con mensaje en el cuerpo.
 * Este interceptor muestra errores globales de forma uniforme.
 */
export const serviceResultInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const message = extractHttpErrorMessage(error);
        if (message !== null && message !== '') {
          notifications.error(message);
        }
      }
      return throwError(() => error);
    }),
  );
};
