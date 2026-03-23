import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export interface SnackbarNotificationData {
  readonly message: string;
  readonly icon: string;
}

@Component({
  selector: 'app-snackbar-notification',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './snackbar-notification.component.html',
  styleUrl: './snackbar-notification.component.scss',
})
export class SnackbarNotificationComponent {
  readonly data = inject<SnackbarNotificationData>(MAT_SNACK_BAR_DATA);
}
