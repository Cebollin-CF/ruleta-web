// screens/LogrosScreen.tsx - VERSIÓN MEJORADA
import React, { useEffect, useState } from 'react';
import { Text, ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import Container from '../components/Container';
import colors from '../utils/colors';

export default function LogrosScreen({ 
  setView, 
  logrosHook,
  stats,
  razonesCount,
  desafiosCount,
  moodCount,
  diasJuntos,
}) {
  const [logrosConEstado, setLogrosConEstado] = useState([]);

  // Preparar datos para los logros
  useEffect(() => {
    const datosUsuario = {
      totalPlanesCompletados: stats?.totalPlanesCompletados || 0,
      diasJuntos: diasJuntos || 0,
      totalFotos: stats?.totalFotos || 0,
      totalRazones: razonesCount || 0,
      diasConPlanes: stats?.diasConPlanes || 0,
      desafiosCompletados: desafiosCount || 0,
      totalMoods: moodCount || 0,
      maxDiasSeguidosConPlanes: 0, // Puedes calcular esto después
      finesDeSemanaCompletos: 0, // Puedes calcular esto después
    };

    const logros = logrosHook.getTodosLogrosConEstado(datosUsuario);
    setLogrosConEstado(logros);
  }, [logrosHook, stats, razonesCount, desafiosCount, moodCount, diasJuntos]);

  const renderLogro = (logro) => {
    const esRepetible = logro.tipo === 'repetible';
    const tieneNiveles = esRepetible && logro.nivelMaximo > 0;

    return (
      <View
        key={logro.id}
        style={[
          styles.logroCard,
          logro.desbloqueado ? styles.logroDesbloqueado : styles.logroBloqueado,
        ]}
      >
        <Text style={styles.logroIcono}>{logro.icono}</Text>
        
        <View style={styles.logroInfo}>
          <Text style={styles.logroTitulo}>
            {logro.titulo}
            {tieneNiveles && ` (Nivel ${logro.nivelActual}/${logro.nivelMaximo})`}
          </Text>
          
          <Text style={styles.logroDescripcion}>{logro.descripcion}</Text>
          
          {/* Progreso para logros repetibles */}
          {esRepetible && tieneNiveles && (
            <View style={styles.progresoContainer}>
              <View style={styles.barraProgresoFondo}>
                <View 
                  style={[
                    styles.barraProgreso,
                    { width: `${logro.progreso}%` }
                  ]} 
                />
              </View>
              
              <Text style={styles.textoProgreso}>
                {logro.valorActual || 0}
                {logro.objetivSiguiente && ` / ${logro.objetivSiguiente}`}
                {logro.objetivSiguiente && ` (${logro.progreso}%)`}
              </Text>
            </View>
          )}
          
          {/* Puntos */}
          <Text style={styles.logroPuntos}>
            {esRepetible && tieneNiveles 
              ? `+${logro.puntos * (logro.nivelActual || 1)} pts` 
              : `+${logro.puntos} pts`}
          </Text>
        </View>

        {/* Estado */}
        <View style={styles.logroEstado}>
          {logro.desbloqueado ? (
            <>
              <Text style={styles.estadoDesbloqueado}>✅</Text>
              {tieneNiveles && (
                <Text style={styles.nivelTexto}>Nvl {logro.nivelActual}</Text>
              )}
            </>
          ) : (
            <Text style={styles.estadoBloqueado}>🔒</Text>
          )}
        </View>
      </View>
    );
  };

  // Agrupar logros por categoría
  const logrosPorCategoria = {
    'Planes': logrosConEstado.filter(l => l.titulo.includes('plan') || l.titulo.includes('Plan')),
    'Fotos': logrosConEstado.filter(l => l.titulo.includes('foto') || l.titulo.includes('Foto')),
    'Razones': logrosConEstado.filter(l => l.titulo.includes('razón') || l.titulo.includes('Razón')),
    'Tiempo': logrosConEstado.filter(l => l.titulo.includes('días') || l.titulo.includes('mes') || l.titulo.includes('año')),
    'Desafíos': logrosConEstado.filter(l => l.titulo.includes('desafío') || l.titulo.includes('Desafío')),
    'Especiales': logrosConEstado.filter(l => !['plan', 'foto', 'razón', 'días', 'desafío'].some(palabra => 
      l.titulo.toLowerCase().includes(palabra))
    ),
  };

  return (
    <Container>
      <Text style={styles.titulo}>
        🏆 Logros y Puntos
      </Text>

      {/* Puntos totales */}
      <View style={styles.puntosContainer}>
        <Text style={styles.puntosTitulo}>PUNTOS TOTALES</Text>
        <Text style={styles.puntosNumero}>{logrosHook.puntos || 0}</Text>
        <Text style={styles.puntosSubtitulo}>
          {logrosHook.logrosDesbloqueados?.length || 0} logros desbloqueados
        </Text>
      </View>

      {/* Lista de logros por categoría */}
      <ScrollView contentContainerStyle={styles.listaContainer}>
        {Object.entries(logrosPorCategoria).map(([categoria, logros]) => {
          if (logros.length === 0) return null;
          
          return (
            <View key={categoria} style={styles.categoriaContainer}>
              <Text style={styles.categoriaTitulo}>
                {categoria} ({logros.filter(l => l.desbloqueado).length}/{logros.length})
              </Text>
              
              {logros.map(renderLogro)}
            </View>
          );
        })}
      </ScrollView>

      {/* Botón volver */}
      <TouchableOpacity
        onPress={() => setView("inicio")}
        style={styles.botonVolver}
      >
        <Text style={styles.botonVolverTexto}>⬅ Volver</Text>
      </TouchableOpacity>
    </Container>
  );
}

const styles = StyleSheet.create({
  titulo: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: 'center',
  },
  puntosContainer: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFB3D1',
  },
  puntosTitulo: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5,
  },
  puntosNumero: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
  },
  puntosSubtitulo: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  listaContainer: {
    paddingBottom: 100,
  },
  categoriaContainer: {
    marginBottom: 25,
  },
  categoriaTitulo: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 5,
  },
  logroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  logroDesbloqueado: {
    backgroundColor: colors.card,
    borderColor: colors.success,
  },
  logroBloqueado: {
    backgroundColor: '#3A2D35',
    borderColor: colors.muted,
    opacity: 0.7,
  },
  logroIcono: {
    fontSize: 40,
    marginRight: 15,
  },
  logroInfo: {
    flex: 1,
  },
  logroTitulo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  logroDescripcion: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginBottom: 8,
  },
  progresoContainer: {
    marginBottom: 8,
  },
  barraProgresoFondo: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  barraProgreso: {
    backgroundColor: colors.success,
    height: '100%',
    borderRadius: 4,
  },
  textoProgreso: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    textAlign: 'right',
  },
  logroPuntos: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
  },
  logroEstado: {
    marginLeft: 10,
    alignItems: 'center',
  },
  estadoDesbloqueado: {
    fontSize: 28,
    color: colors.success,
  },
  estadoBloqueado: {
    fontSize: 28,
    color: colors.muted,
  },
  nivelTexto: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  botonVolver: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: colors.warning,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: colors.warning,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  botonVolverTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});