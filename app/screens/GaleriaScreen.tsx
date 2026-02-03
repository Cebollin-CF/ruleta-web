import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Container from "../components/Container";
import colors from "../utils/colors";

export default function GaleriaScreen({ setView }) {
  return (
    <Container>
      <Text style={{ color: colors.accent, fontSize: 32, fontWeight: "800" }}>
        🖼 Galería
      </Text>

      <Text style={{ color: colors.muted }}>
        Aquí irá tu galería completa con zoom, swipe y animaciones.
      </Text>

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