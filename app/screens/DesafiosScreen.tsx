import React from "react";
import { Text, ScrollView, TouchableOpacity, View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import Container from "../components/Container";
import colors from "../utils/colors";
import { Desafio } from "../utils/types";

interface DesafiosScreenProps {
  setView: (view: string) => void;
  desafioActual: Desafio | null;
  progreso: number;
  completarDesafio: () => Promise<any>;
  generarNuevoDesafio: () => Promise<any>;
  desafiosDisponibles: Desafio[];
  ultimaActualizacion: string | null;
  intentosCambio: number;
  mostrarToast: (mensaje: string, tipo?: 'success' | 'error' | 'warning' | 'info', emoji?: string) => void;
}

export default function DesafiosScreen({
  setView,
  desafioActual,
  progreso,
  completarDesafio,
  generarNuevoDesafio,
  desafiosDisponibles,
  ultimaActualizacion,
  intentosCambio,
  mostrarToast,
}: DesafiosScreenProps) {
  const porcentaje = desafioActual ? Math.min((progreso / desafioActual.meta) * 100, 100) : 0;
  const hoy = new Date().toISOString().split('T')[0];
  const completadoHoy = (desafioActual?.meta || 0) > 1 && ultimaActualizacion === hoy;
  const estaBloqueado = progreso > 0 && progreso < (desafioActual?.meta || 0);

  const handleCompletar = async () => {
    if (completadoHoy) {
      mostrarToast("Ya has avanzado hoy. ¡Vuelve mañana!", "info", "⏳");
      return;
    }

    const resultado = await completarDesafio();
    if (resultado?.success) {
      if (resultado.completado) {
        mostrarToast("¡Desafío completado!", "success", "🎉");
      } else {
        mostrarToast("¡Progreso registrado!", "success", "✅");
      }
    } else if (resultado?.error) {
      mostrarToast(resultado.error, "error", "❌");
    }
  };

  const cambiarDesafio = async () => {
    if (estaBloqueado) {
      mostrarToast("No puedes cambiar un desafío en progreso", "warning", "⚠️");
      return;
    }

    const resultado = await generarNuevoDesafio();
    if (resultado?.success) {
      mostrarToast("Nuevo desafío generado", "success", "🎲");
    } else if (resultado?.error) {
      mostrarToast(resultado.error, "error", "❌");
    }
  };

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>🏆 Desafío de Pareja</Text>

        {desafioActual ? (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.card}
          >
            <Text style={styles.emoji}>{desafioActual.emoji}</Text>
            <Text style={styles.desafioTexto}>{desafioActual.texto}</Text>

            <View style={styles.progresoContainer}>
              <View style={styles.barraFondo}>
                <View style={[styles.barraProgreso, { width: `${porcentaje}%` }]} />
              </View>
              <Text style={styles.progresoTexto}>
                {progreso} / {desafioActual.meta} {desafioActual.duracion}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.botonPrincipal, (completadoHoy || estaBloqueado) && styles.botonDeshabilitado]}
              onPress={handleCompletar}
              disabled={completadoHoy || estaBloqueado}
            >
              <Text style={styles.botonTexto}>
                {completadoHoy ? "¡Listo por hoy! ✨" : "Completar paso ✅"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botonSecundario, estaBloqueado && styles.botonDeshabilitado]}
              onPress={cambiarDesafio}
              disabled={estaBloqueado}
            >
              <Text style={styles.botonSecundarioTexto}>
                Cambiar desafío ({5 - intentosCambio} restantes) 🎲
              </Text>
            </TouchableOpacity>
          </MotiView>
        ) : (
          <View style={styles.sinDesafio}>
            <Text style={styles.textoVacio}>No hay desafío activo</Text>
            <TouchableOpacity style={styles.botonPrincipal} onPress={generarNuevoDesafio}>
              <Text style={styles.botonTexto}>Generar desafío 🎲</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoSeccion}>
          <Text style={styles.infoTitulo}>¿Cómo funciona?</Text>
          <Text style={styles.infoTexto}>
            Cada desafío tiene una meta. Registra tu progreso cada día para completarlo y ganar puntos.
            ¡No te saltes ningún día!
          </Text>
        </View>

        {/* LISTA DE DESAFÍOS DISPONIBLES */}
        <View style={styles.listaDesafiosSection}>
          <Text style={styles.listaDesafiosTitulo}>📋 Desafíos Disponibles</Text>

          {Object.entries(
            desafiosDisponibles.reduce((acc: { [key: string]: Desafio[] }, d) => {
              const cat = d.categoria || "Otros";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(d);
              return acc;
            }, {})
          ).map(([categoria, lista]) => (
            <View key={categoria} style={styles.categoriaGrupo}>
              <Text style={styles.categoriaSubtitulo}>{categoria.toUpperCase()}</Text>
              {lista.map((d, index) => (
                <View key={index} style={styles.desafioListItem}>
                  <Text style={styles.desafioListEmoji}>{d.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.desafioListTexto}>{d.texto}</Text>
                    <Text style={styles.desafioListMeta}>Meta: {d.meta} {d.duracion}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={() => setView("inicio")} style={styles.botonVolver}>
          <Text style={styles.botonVolverTexto}>⬅ Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.accent,
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary + "40",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 70,
    marginBottom: 20,
  },
  desafioTexto: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 30,
  },
  progresoContainer: {
    width: "100%",
    marginBottom: 30,
  },
  barraFondo: {
    height: 15,
    backgroundColor: colors.primary + "20",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  barraProgreso: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  progresoTexto: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  botonPrincipal: {
    backgroundColor: colors.primary,
    width: "100%",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 15,
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  botonTexto: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  botonSecundario: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  botonSecundarioTexto: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  sinDesafio: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  textoVacio: {
    color: colors.muted,
    fontSize: 18,
    marginBottom: 20,
  },
  infoSeccion: {
    marginTop: 40,
    padding: 20,
  },
  infoTitulo: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  infoTexto: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  botonVolver: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: colors.warning,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  botonVolverTexto: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  listaDesafiosSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  listaDesafiosTitulo: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: 'center',
  },
  categoriaGrupo: {
    marginBottom: 25,
  },
  categoriaSubtitulo: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 12,
    marginLeft: 5,
  },
  desafioListItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF10',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  desafioListEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  desafioListTexto: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  desafioListMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
});