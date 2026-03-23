import { animate, style, transition, trigger } from '@angular/animations';

/** Fade-in del contenedor de listas al montarse. */
export const listFadeIn = trigger('listFadeIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate(
      '320ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }),
    ),
  ]),
]);

/** Entrada suave de filas nuevas en tablas Material. */
export const rowAnimation = trigger('rowAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(6px)' }),
    animate(
      '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }),
    ),
  ]),
]);
