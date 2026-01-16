import React from "react";
import { Text, TextInput, ScrollView } from "react-native";
import Container from "../components/Container";
import Boton from "../components/Boton";
import colors from "../utils/colors";

export default function NotasScreen({
  setView,
  notaTexto,
  setNotaTexto,
  notas,
  guardarNota,
}) {
  return (
    <Container>
      <Text style={{ color: colors.accent, fontSize: 32, fontWeight: "800" }}>
        📝 Notas
      </Text>

      <TextInput
        placeholder="Escribe una nota..."
        placeholderTextColor={colors.muted}
        value={notaTexto}
        onChangeText={setNotaTexto}
        style={{
          backgroundColor: colors.card,
          color: colors.text,
          padding: 14,
          borderRadius: 20,
          marginBottom: 10,
        }}
      />

      <Boton text="Guardar nota 💌" color={colors.primary} onPress={guardarNota} />

      <ScrollView style={{ marginTop: 20 }}>
        {notas.map((n) => (
          <Text key={n.id} style={{ color: colors.text, marginBottom: 10 }}>
            {n.texto}
          </Text>
        ))}
      </ScrollView>

      <Boton text="⬅ Volver" color={colors.warning} onPress={() => setView("inicio")} />
    </Container>
  );
}
