import { Rol } from './rol';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  
  // 🟢 CLAVE: Agregar 'password' como opcional para el envío al backend
  password?: string; 
  
  rol: Rol;
  activo: boolean;
  fechaCreacion: Date; 
}