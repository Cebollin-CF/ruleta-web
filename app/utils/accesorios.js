export const ACCESORIOS_TIENDA = [
  // Gorros
  { 
    id: 'sombrero_pirata',
    nombre: 'Sombrero de Pirata',
    tipo: 'cabeza',
    precio: 50,
    emoji: '🏴‍☠️',
    efecto: 'Aventura +10%',
    posicion: { top: -15, left: 25 }
  },
  { 
    id: 'corona',
    nombre: 'Corona Real',
    tipo: 'cabeza', 
    precio: 200,
    emoji: '👑',
    efecto: 'Planes románticos x2 puntos',
    posicion: { top: -20, left: 30 }
  },
  
  // Ropa
  { 
    id: 'camiseta_corazon',
    nombre: 'Camiseta con Corazón',
    tipo: 'ropa',
    precio: 30,
    emoji: '❤️',
    efecto: '+5 puntos por razón nueva',
    posicion: { top: 30, left: 20 }
  },
  { 
    id: 'chaqueta_cuero',
    nombre: 'Chaqueta de Cuero',
    tipo: 'ropa',
    precio: 150,
    emoji: '🕶️',
    efecto: 'Desafíos 15% más rápido',
    posicion: { top: 25, left: 15 }
  },
  
  // Accesorios especiales (se desbloquean)
  { 
    id: 'collar_diamantes',
    nombre: 'Collar de Diamantes',
    tipo: 'cuello',
    precio: 0, // Gratis al completar felicidad
    emoji: '💎',
    efecto: 'Exclusivo: Felicidad Completa',
    posicion: { top: 50, left: 35 },
    exclusivo: true
  },
  { 
    id: 'alas_hada',
    nombre: 'Alas de Hada',
    tipo: 'espalda',
    precio: 300,
    emoji: '🧚',
    efecto: 'Desbloquea planes mágicos',
    posicion: { top: 20, left: 0 }
  },
  { 
    id: 'antorcha',
    nombre: 'Antorcha Legendaria',
    tipo: 'mano',
    precio: 500,
    emoji: '🔥',
    efecto: 'Rachas no se rompen 7 días',
    posicion: { top: 40, left: 60 }
  }
];