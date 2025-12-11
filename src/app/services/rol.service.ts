// src/app/services/rol.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Rol } from '../models/entity/rol';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = `${environment.apiBaseUrl}/roles`;

  constructor(private http: HttpClient) { }

  //  Solo ADMIN puede listar roles
  listar(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  //  Solo ADMIN puede crear roles
  guardar(rol: Rol): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, rol);
  }
}