import React from "react";
import { Text, ScrollView, Image } from "react-native";
import Container from "../components/Container";
import Boton from "../components/Boton";
import colors from "../utils/colors";

export default function TimelineScreen({ setView, eventos }) {
  return (
    <Container>
      <Text style={{ color: colors.accent, fontSize: 32, fontWeight: "800" }}>
        📜 Recuerdos juntos
      </Text>

      <ScrollView>
        {eventos.map((ev, idx) => (
          <Container key={idx} style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.text }}>{ev.fecha}</Text>
            <Text style={{ color: colors.primary, fontSize: 18 }}>{ev.titulo}</Text>

            <ScrollView horizontal>
              {ev.fotos.map((url, i) => (
                <Image
                  key={i}
                  source={{ uri: url }}
                  style={{ width: 80, height: 80, borderRadius: 16, marginRight: 8 }}
                />
              ))}
            </ScrollView>
          </Container>
        ))}
      </ScrollView>

      <Boton text="⬅ Volver" color={colors.warning} onPress={() => setView("inicio")} />
    </Container>
  );
}
