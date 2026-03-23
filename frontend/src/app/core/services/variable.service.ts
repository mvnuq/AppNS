import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Variable, VariablePayload } from '../models/variable.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class VariableService {
  private readonly api = inject(ApiService);
  private static readonly path = '/variables';

  getAll(): Observable<Variable[]> {
    return this.api.get<Variable[]>(VariableService.path);
  }

  getById(id: number): Observable<Variable> {
    return this.api.get<Variable>(`${VariableService.path}/${String(id)}`);
  }

  create(payload: VariablePayload): Observable<Variable> {
    return this.api.post<Variable>(VariableService.path, payload);
  }

  update(id: number, payload: VariablePayload): Observable<void> {
    return this.api.put<void>(`${VariableService.path}/${String(id)}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.api.delete(`${VariableService.path}/${String(id)}`);
  }
}
