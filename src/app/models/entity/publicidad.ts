import { Horario } from './horario';


export interface Publicidad {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  horario: Horario;
  activo: boolean;
  fechaInicio: Date; 
  fechaFin: Date;   
}
