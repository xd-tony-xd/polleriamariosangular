import { Horario } from './horario';


export interface MenuDia {
  id: number;
  fecha: Date; 
  horario: Horario;
  titulo: string;
  descripcion: string;
  imagen: string;
  precio: number;
  disponible: boolean;
}
