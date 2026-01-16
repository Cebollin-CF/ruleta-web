import React from "react";
import { Text, View } from "react-native";
import Container from "../components/Container";
import Boton from "../components/Boton";
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

      <Boton text="⬅ Volver" color={colors.warning} onPress={() => setView("inicio")} />
    </Container>
  );
}
