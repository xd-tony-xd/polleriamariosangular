// src/app/services/plato.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Plato } from '../models/entity/plato';

@Injectable({
  providedIn: 'root'
})
export class PlatoService {
  private apiUrl = `${environment.apiBaseUrl}/platos`;

  constructor(private http: HttpClient) { }

  // =========================================================
  // MÉTODOS PÚBLICOS (GET)
  // =========================================================
  listar(): Observable<Plato[]> {
    return this.http.get<Plato[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Plato> {
    return this.http.get<Plato>(`${this.apiUrl}/${id}`);
  }

  // =========================================================
  // 🚨 MÉTODOS DE ESCRITURA CON FORM-DATA (Como MenuDiaService) 🚨
  // =========================================================

  /**
   * Guarda un nuevo Plato enviando un objeto FormData (incluye archivo de imagen).
   */
  guardarFormData(formData: FormData): Observable<Plato> {
    return this.http.post<Plato>(this.apiUrl, formData);
  }

  /**
   * Edita un Plato existente enviando un objeto FormData.
   */
  editarFormData(id: number, formData: FormData): Observable<Plato> {
    return this.http.put<Plato>(`${this.apiUrl}/${id}`, formData);
  }

  // =========================================================
  // MÉTODOS SIMPLES
  // =========================================================

  cambiarDisponibilidad(id: number, disponible: boolean): Observable<Plato> {
    // Llama al endpoint simple del backend: PUT /api/platos/{id}/disponibilidad
    return this.http.put<Plato>(`${this.apiUrl}/${id}/disponibilidad`, disponible);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}