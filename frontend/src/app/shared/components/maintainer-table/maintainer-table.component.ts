import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * Contenedor estándar para tablas de mantenedoras: scroll horizontal,
 * clase `data-table` y mensaje cuando no hay filas.
 */
@Component({
  selector: 'app-maintainer-table',
  standalone: true,
  templateUrl: './maintainer-table.component.html',
  styleUrl: './maintainer-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaintainerTableComponent {
  @Input({ required: true }) empty!: boolean;
  @Input() emptyMessage = '';
}
