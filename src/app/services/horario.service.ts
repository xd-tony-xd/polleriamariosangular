// src/app/services/horario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Horario } from '../models/entity/horario';

@Injectable({
  providedIn: 'root'
})
export class HorarioService {
  private apiUrl = `${environment.apiBaseUrl}/horarios`;

  constructor(private http: HttpClient) { }

  //  Todos pueden ver horarios
  listar(): Observable<Horario[]> {
    return this.http.get<Horario[]>(this.apiUrl);
  }

  //  Todos pueden buscar por ID
  buscarPorId(id: number): Observable<Horario> {
    return this.http.get<Horario>(`${this.apiUrl}/${id}`);
  }

  //  Solo ADMIN puede crear
  guardar(horario: Horario): Observable<Horario> {
    return this.http.post<Horario>(this.apiUrl, horario);
  }

  //  Solo ADMIN puede editar
  editar(id: number, horario: Horario): Observable<Horario> {
    return this.http.put<Horario>(`${this.apiUrl}/${id}`, horario);
  }

  //  Solo ADMIN puede eliminar
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}