import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { extractHttpErrorMessage } from '../utils/http-error.util';

/**
 * Los fallos de ServiceResult en el backend se mapean a códigos HTTP (400/404) con mensaje en el cuerpo.
 * Este interceptor muestra errores globales de forma uniforme.
 */
export const serviceResultInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const message = extractHttpErrorMessage(error);
        snackBar.open(message, 'Cerrar', {
          duration: 6000,
          panelClass: ['neosoft-snackbar-error'],
        });
      }
      return throwError(() => error);
    }),
  );
};
