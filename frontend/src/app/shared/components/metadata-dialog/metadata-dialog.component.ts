import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

export interface MetadataDialogData {
  readonly createdAt: Date;
  readonly updatedAt: Date | null;
}

@Component({
  selector: 'app-metadata-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, DatePipe],
  templateUrl: './metadata-dialog.component.html',
  styleUrl: './metadata-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataDialogComponent {
  readonly data = inject<MetadataDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<MetadataDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }
}
