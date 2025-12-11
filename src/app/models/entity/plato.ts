import { Categoria } from './categoria';
import { Horario } from './horario';

export interface Plato {
  id: number;
  categoria: Categoria;
  horario: Horario;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  disponible: boolean;
}
