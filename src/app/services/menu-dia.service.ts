// src/app/services/menu-dia.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { MenuDia } from '../models/entity/menu-dia';

@Injectable({
  providedIn: 'root'
})
export class MenuDiaService {
  private apiUrl = `${environment.apiBaseUrl}/menus`;

  constructor(private http: HttpClient) { }

  // =========================================================
  // MÉTODOS PÚBLICOS (GET)
  // =========================================================

  //  Todos pueden ver menús
  listar(): Observable<MenuDia[]> {
    return this.http.get<MenuDia[]>(this.apiUrl);
  }

  //  Todos pueden buscar por ID
  buscarPorId(id: number): Observable<MenuDia> {
    return this.http.get<MenuDia>(`${this.apiUrl}/${id}`);
  }

  //  Todos pueden buscar por fecha
  buscarPorFecha(fecha: string): Observable<MenuDia[]> {
    return this.http.get<MenuDia[]>(`${this.apiUrl}/fecha/${fecha}`);
  }

  //  Todos pueden buscar por horario
  buscarPorHorario(idHorario: number): Observable<MenuDia[]> {
    return this.http.get<MenuDia[]>(`${this.apiUrl}/horario/${idHorario}`);
  }

  // =========================================================
  // MÉTODOS PRIVADOS (ADMIN - JSON)
  // Estos podrían ser redundantes si solo se usa FormData, pero se mantienen por si acaso.
  // =========================================================

  //  Solo ADMIN puede crear (JSON)
  guardar(menu: MenuDia): Observable<MenuDia> {
    return this.http.post<MenuDia>(this.apiUrl, menu);
  }

  //  Solo ADMIN puede editar (JSON)
  editar(id: number, menu: MenuDia): Observable<MenuDia> {
    return this.http.put<MenuDia>(`${this.apiUrl}/${id}`, menu);
  }

  //  Solo ADMIN puede eliminar
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // =========================================================
  // 🚨 MÉTODOS FALTANTES: FormData (Para subir archivos) 🚨
  // =========================================================

  /**
   * Guarda un nuevo menú enviando un objeto FormData (incluye archivo de imagen).
   */
  guardarFormData(formData: FormData): Observable<MenuDia> {
    // El HttpClient de Angular detecta que estás enviando FormData 
    // y automáticamente establece el Content-Type correcto: multipart/form-data.
    return this.http.post<MenuDia>(this.apiUrl, formData);
  }

  /**
   * Edita un menú existente enviando un objeto FormData.
   */
  editarFormData(id: number, formData: FormData): Observable<MenuDia> {
    return this.http.put<MenuDia>(`${this.apiUrl}/${id}`, formData);
  }
}