export type Usuario = {
  id: string;
  couple_id: string;
  nombre: string;
  avatar_url: string | null;
  usuario_numero: number;
  creado_en: string;
  puntos_totales?: number;
};

export type MoodUsuario = {
  id: string;
  usuario_id: string;
  couple_id: string;
  emoji: string;
  nombre: string;
  fecha: string;
  creado_en: string;
};

export interface Plan {
  id: string;
  titulo: string;
  precio: string | null;
  duracion?: string | null;
  categoria?: string | null;
  completado?: boolean;
  creadoPor?: string;
  fechaVencimiento?: string | null;
  fotos?: string[];
}

export interface DatedPlan {
  planId: string;
  fotos: string[];
  opinion: string;
  puntaje: number;
  precio: string | null;
  duracion: string | null;
  completado: boolean;
  seguirEnRuleta: boolean;
  titulo?: string;
}

export interface PlanesPorDia {
  [fecha: string]: DatedPlan[];
}

export interface Desafio {
  emoji: string;
  texto: string;
  meta: number;
  duracion: string;
  categoria?: string;
}

export interface Logro {
  id: string;
  titulo: string;
  descripcion: string;
  puntos: number;
  icono: string;
  tipo: 'unico' | 'repetible';
  condicion: (datos: any) => boolean | number;
  niveles?: number[];
}

export interface Nota {
  id: string;
  texto: string;
  fecha: string;
  color?: string;
  categoria: string; // ✅ Requerido para evitar errores en index.tsx
  usuario?: string;
  usuarioId?: string;
}

export interface Razon {
  id: string;
  texto: string;
  fecha: string;
  autor: string;
  autorId?: string;
  usuarioNumero?: number;
}

export interface Mascota {
  nombre: string;
  nivel: number;
  experiencia: number;
  experienciaNecesaria: number;
  especie: string;
  estado: string;
  accesorios: any[];
  felicidad: number;
  ultimaInteraccion: string;
  temporizadores: {
    [usuarioKey: string]: {
      acariciar: string | null;
      alimentar: string | null;
      jugar: string | null;
    };
  };
  recompensasDesbloqueadas: any[];
}

export interface AppStateContent {
  planes?: Plan[];
  planesPorDia?: PlanesPorDia;
  razones?: Razon[];
  razonDelDia?: Razon | null;
  notas?: Nota[];
  desafioActual?: Desafio | null;
  progresoDesafio?: number;
  ultimaActualizacionDesafio?: string | null;
  intentosCambio?: number;
  logrosDesbloqueados?: string[];
  puntos?: number;
  mascota?: Mascota;
  fechaAniversario?: string | null;
  avatarUrl?: string | null;
}