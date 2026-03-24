import { MatDialog } from '@angular/material/dialog';
import {
  MetadataDialogComponent,
  MetadataDialogData,
} from './metadata-dialog.component';

const metadataDialogConfig = {
  width: '380px',
  maxWidth: '95vw',
  backdropClass: 'metadata-dialog-backdrop',
  panelClass: 'metadata-dialog-panel',
  autoFocus: 'dialog',
} as const;

/** Abre el diálogo de fechas de auditoría (creado / última actualización). */
export function openMetadataDialog(
  dialog: MatDialog,
  data: MetadataDialogData,
): void {
  dialog.open(MetadataDialogComponent, {
    ...metadataDialogConfig,
    data,
  });
}
