import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Container from "../components/Container";
import colors from "../utils/colors";

export default function EstadisticasScreen({ setView, stats }) {
  return (
    <Container>
      <Text style={{ color: colors.accent, fontSize: 32, fontWeight: "800" }}>
        📊 Estadísticas
      </Text>

      <View style={{ marginTop: 20 }}>
        <Text style={{ color: colors.text }}>Planes creados: {stats.totalPlanes}</Text>
        <Text style={{ color: colors.text }}>Días con planes: {stats.diasConPlanes}</Text>
        <Text style={{ color: colors.text }}>Fotos subidas: {stats.totalFotos}</Text>
      </View>

      {/* Botón flotante */}
      <TouchableOpacity
        onPress={() => setView("inicio")}
        style={{
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
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
          ⬅ Volver
        </Text>
      </TouchableOpacity>
    </Container>
  );
}