export type Usuario = {
  id: string;
  couple_id: string;
  nombre: string;
  avatar_url: string | null;
  usuario_numero: 1 | 2;
  creado_en: string;
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

export type Plan = {
  id: string;
  titulo: string;
  precio?: string;
  duracion?: string;
  categoria?: string;
  completado?: boolean;
  createdBy?: string;
};