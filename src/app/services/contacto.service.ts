// src/app/services/contacto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Contacto } from '../models/entity/contacto';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private apiUrl = `${environment.apiBaseUrl}/contactos`;

  constructor(private http: HttpClient) { }

  //  Solo ADMIN puede ver contactos
  listar(): Observable<Contacto[]> {
    return this.http.get<Contacto[]>(this.apiUrl);
  }

  //  Cualquiera puede enviar contacto (formulario público)
  guardar(contacto: Contacto): Observable<Contacto> {
    return this.http.post<Contacto>(this.apiUrl, contacto);
  }

  //  Solo ADMIN puede eliminar
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}