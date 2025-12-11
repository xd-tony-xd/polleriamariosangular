// src/app/services/publicidad.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Publicidad } from '../models/entity/publicidad';

@Injectable({
  providedIn: 'root'
})
export class PublicidadService {
  private apiUrl = `${environment.apiBaseUrl}/publicidad`;

  constructor(private http: HttpClient) { }

  // =========================================================
  // MÉTODOS PÚBLICOS (GET)
  // =========================================================

  listar(): Observable<Publicidad[]> {
    return this.http.get<Publicidad[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Publicidad> {
    return this.http.get<Publicidad>(`${this.apiUrl}/${id}`);
  }

  buscarPorHorario(idHorario: number): Observable<Publicidad[]> {
    return this.http.get<Publicidad[]>(`${this.apiUrl}/horario/${idHorario}`);
  }

  // =========================================================
  // 🚨 MÉTODOS DE ESCRITURA CON FORM-DATA (Para subir archivos) 🚨
  // =========================================================

  /**
   * Guarda una nueva publicidad enviando un objeto FormData.
   */
  guardarFormData(formData: FormData): Observable<Publicidad> {
    // Usamos el método POST simple, el FormData se maneja solo
    return this.http.post<Publicidad>(this.apiUrl, formData);
  }

  /**
   * Edita una publicidad existente enviando un objeto FormData.
   */
  editarFormData(id: number, formData: FormData): Observable<Publicidad> {
    return this.http.put<Publicidad>(`${this.apiUrl}/${id}`, formData);
  }
  
  //  Solo ADMIN puede eliminar
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}