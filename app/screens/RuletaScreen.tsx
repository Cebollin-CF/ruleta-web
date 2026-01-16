import React from "react";
import { Text, View } from "react-native";
import Container from "../components/Container";
import Boton from "../components/Boton";
import colors from "../utils/colors";
import { MotiView } from "moti";

export default function RuletaScreen({
  setView,
  planes,
  planActual,
  girar,
  intentosRuleta,
}) {
  return (
    <Container>
      <Text
        style={{
          color: colors.accent,
          fontSize: 32,
          fontWeight: "800",
          marginBottom: 20,
        }}
      >
        🎡 Ruleta de planes
      </Text>

      <MotiView
        from={{ rotate: "0deg" }}
        animate={{ rotate: `${intentosRuleta * 360}deg` }}
        transition={{ type: "timing", duration: 800 }}
        style={{
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: colors.card,
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ color: colors.primary, fontSize: 22 }}>🎲</Text>
      </MotiView>

      {!planActual ? (
        <Boton text="Girar ruleta 🎲" color={colors.primary} onPress={girar} />
      ) : (
        <>
          <Text style={{ color: colors.primary, fontSize: 26, textAlign: "center" }}>
            {planActual.titulo}
          </Text>

          {intentosRuleta < 3 && (
            <Boton text="Quiero otro 😈" color={colors.secondary} onPress={girar} />
          )}

          <Boton text="Este mola ❤️" color={colors.success} onPress={() => setView("calendario")} />
        </>
      )}

      <Boton text="⬅ Volver" color={colors.warning} onPress={() => setView("inicio")} />
    </Container>
  );
}
