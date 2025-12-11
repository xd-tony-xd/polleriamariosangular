// src/app/services/extra.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Extra } from '../models/entity/extra';

@Injectable({
  providedIn: 'root'
})
export class ExtraService {
  private apiUrl = `${environment.apiBaseUrl}/extras`;

  constructor(private http: HttpClient) { }

  listar(): Observable<Extra[]> {
    return this.http.get<Extra[]>(this.apiUrl);
  }

  // 🚨 AJUSTADO: Acepta FormData (contiene datos y el archivo binario)
  guardar(extraData: FormData): Observable<Extra> {
    // El tipo any es necesario porque FormData no coincide con la interfaz Extra
    return this.http.post<Extra>(this.apiUrl, extraData as any);
  }

  // 🚨 AJUSTADO: Acepta FormData para editar la imagen o los datos
  editar(id: number, extraData: FormData): Observable<Extra> {
    return this.http.put<Extra>(`${this.apiUrl}/${id}`, extraData as any);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}