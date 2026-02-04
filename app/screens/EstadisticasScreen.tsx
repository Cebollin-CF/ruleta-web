import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import Container from "../components/Container";
import colors from "../utils/colors";

type EstadisticasScreenProps = {
  setView: (view: string) => void;
  stats: {
    totalPlanes: number;
    diasConPlanes: number;
    totalFotos: number;
    totalNotas?: number;
    totalLogros?: number;
    totalDesafios?: number;
    moodPromedio?: number;
    mascotaNombre?: string;
    usuarioNombre?: string;
    puntos?: number;
  };
};

export default function EstadisticasScreen({ setView, stats }: EstadisticasScreenProps) {
  return (
    <Container>
      <Text style={styles.titulo}>📊 Estadísticas</Text>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>📝</Text>
          <Text style={styles.cardLabel}>Notas</Text>
          <Text style={styles.cardValue}>{stats.totalNotas ?? "-"}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>📷</Text>
          <Text style={styles.cardLabel}>Fotos</Text>
          <Text style={styles.cardValue}>{stats.totalFotos}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardEmoji}>🏆</Text>
          <Text style={styles.cardLabel}>Logros</Text>
          <Text style={styles.cardValue}>{stats.totalLogros ?? "-"}</Text>
        </View>
      </View>

      <View style={{ marginTop: 30 }}>
        <Text style={styles.statLine}>❤️ Planes creados: <Text style={styles.statValue}>{stats.totalPlanes}</Text></Text>
        <Text style={styles.statLine}>📅 Días con planes: <Text style={styles.statValue}>{stats.diasConPlanes}</Text></Text>
        <Text style={styles.statLine}>🎯 Desafíos completados: <Text style={styles.statValue}>{stats.totalDesafios ?? "-"}</Text></Text>
        <Text style={styles.statLine}>😊 Mood promedio: <Text style={styles.statValue}>{stats.moodPromedio !== undefined ? stats.moodPromedio.toFixed(1) : "-"}</Text></Text>
        {stats.mascotaNombre && (
          <Text style={styles.statLine}>🐾 Mascota: <Text style={styles.statValue}>{stats.mascotaNombre}</Text></Text>
        )}
        {stats.usuarioNombre && (
          <Text style={styles.statLine}>👤 Usuario: <Text style={styles.statValue}>{stats.usuarioNombre}</Text></Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => setView("inicio")}
        style={styles.fab}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
          ⬅ Volver
        </Text>
      </TouchableOpacity>
    </Container>
  );
}

const styles = StyleSheet.create({
  titulo: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  card: {
    backgroundColor: colors.bgBottom,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: 90,
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  cardLabel: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 2,
  },
  cardValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "bold",
  },
  statLine: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 6,
  },
  statValue: {
    color: colors.primary,
    fontWeight: "bold",
  },
  fab: {
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
    flexDirection: "row",
    alignItems: "center",
  },
});