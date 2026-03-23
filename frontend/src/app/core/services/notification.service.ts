import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SnackbarNotificationComponent,
  SnackbarNotificationData,
} from '../../shared/components/snackbar-notification/snackbar-notification.component';

const DEFAULT_DURATION_MS = 4500;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.openWithIcon(message, 'check_circle', 'neosoft-snackbar-success');
  }

  error(message: string): void {
    this.openWithIcon(message, 'report', 'neosoft-snackbar-error', 8000);
  }

  info(message: string): void {
    this.openWithIcon(message, 'info', 'neosoft-snackbar-info');
  }

  warning(message: string): void {
    this.openWithIcon(message, 'priority_high', 'neosoft-snackbar-warning');
  }

  private openWithIcon(
    message: string,
    icon: string,
    panelClass: string,
    durationMs: number = DEFAULT_DURATION_MS,
  ): void {
    const data: SnackbarNotificationData = { message, icon };
    this.snackBar.openFromComponent(SnackbarNotificationComponent, {
      data,
      duration: durationMs,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [panelClass, 'neosoft-snackbar'],
    });
  }
}
