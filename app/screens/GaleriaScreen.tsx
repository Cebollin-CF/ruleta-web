import React from "react";
import { Text } from "react-native";
import Container from "../components/Container";
import Boton from "../components/Boton";
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

      <Boton text="⬅ Volver" color={colors.warning} onPress={() => setView("inicio")} />
    </Container>
  );
}
