import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Container from "../components/Container";
import Boton from "../components/Boton";
import colors from "../utils/colors";
import { MotiView } from "moti";

export default function InicioScreen({ setView, coupleId }) {
  return (
    <Container>

      {/* TÍTULO */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
      >
        <Text
          style={{
            color: colors.accent,
            fontSize: 36,
            fontWeight: "800",
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          💕 PLANES V x A 💕
        </Text>
      </MotiView>

      {/* SUBTÍTULO */}
      <Text
        style={{
          color: colors.text,
          textAlign: "center",
          marginBottom: 20,
          fontSize: 16,
        }}
      >
        Elige juntos vuestro próximo plan
      </Text>

      {/* BOTÓN PRINCIPAL */}
      <Boton
        text="🎡 Elegir plan"
        color={colors.primary}
        onPress={() => setView("ruleta")}
      />

      {/* BOTONES SECUNDARIOS ARRIBA */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Boton
            text="➕ Nuevo"
            small
            color={colors.secondary}
            onPress={() => setView("nuevo")}
          />
        </View>

        <View style={{ flex: 1, marginHorizontal: 6 }}>
          <Boton
            text="📆 Calendario"
            small
            color={colors.success}
            onPress={() => setView("calendario")}
          />
        </View>

        <View style={{ flex: 1, marginLeft: 6 }}>
          <Boton
            text="🖼 Galería"
            small
            color={colors.warning}
            onPress={() => setView("galeria")}
          />
        </View>
      </View>

      {/* BOTONES PEQUEÑOS ABAJO */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Boton
            text="📊 Estadísticas"
            small
            color={colors.success}
            onPress={() => setView("estadisticas")}
          />
        </View>

        <View style={{ flex: 1, marginHorizontal: 6 }}>
          <Boton
            text="📜 Timeline"
            small
            color={colors.secondary}
            onPress={() => setView("timeline")}
          />
        </View>

        <View style={{ flex: 1, marginLeft: 6 }}>
          <Boton
            text="📝 Notas"
            small
            color={colors.warning}
            onPress={() => setView("notas")}
          />
        </View>
      </View>

      {/* INFO DE PAREJA */}
      <View style={{ marginTop: 30, alignItems: "center" }}>
        <Text style={{ color: colors.muted }}>Pareja vinculada:</Text>

        <Text
          style={{
            color: colors.text,
            fontWeight: "600",
            fontSize: 16,
            marginTop: 4,
          }}
        >
          {coupleId ?? "Sin vínculo"}
        </Text>

        <TouchableOpacity onPress={() => setView("vinculo")}>
          <Text
            style={{
              color: colors.secondary,
              marginTop: 6,
              fontWeight: "600",
            }}
          >
            Gestionar vínculo →
          </Text>
        </TouchableOpacity>
      </View>

    </Container>
  );
}
