import React from "react";
import { Text, ScrollView, TouchableOpacity, View } from "react-native";
import { MotiView } from "moti";
import Container from "../components/Container";
import colors from "../utils/colors";

export default function DesafiosScreen({
  setView,
  desafioActual,
  progreso,
  completarDesafio,
  generarNuevoDesafio,
}) {
  const desafiosDisponibles = [
    { emoji: "📸", texto: "Enviaos 1 foto diaria durante 7 días", meta: 7 },
    { emoji: "💌", texto: "Escribid 1 cosa bonita al día durante 5 días", meta: 5 },
    { emoji: "🎁", texto: "Sorprendeos con detalles pequeños 3 veces", meta: 3 },
    { emoji: "🍽️", texto: "Cocinад juntos 4 comidas esta semana", meta: 4 },
    { emoji: "🚶", texto: "Dad un paseo juntos 6 días seguidos", meta: 6 },
    { emoji: "❤️", texto: "Decidnos 'te quiero' sin motivo 10 veces", meta: 10 },
  ];

  const porcentaje = desafioActual ? Math.min((progreso / desafioActual.meta) * 100, 100) : 0;

  return (
    <Container>
      <Text
        style={{
          color: colors.accent,
          fontSize: 32,
          fontWeight: "800",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        🎯 Desafíos de pareja
      </Text>

      {/* Desafío actual */}
      {desafioActual ? (
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "timing", duration: 400 }}
          style={{
            backgroundColor: colors.primary,
            padding: 24,
            borderRadius: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 50, textAlign: "center", marginBottom: 10 }}>
            {desafioActual.emoji}
          </Text>

          <Text style={{ color: "#fff", fontSize: 18, textAlign: "center", fontWeight: "700", marginBottom: 16 }}>
            {desafioActual.texto}
          </Text>

          {/* Barra de progreso */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.3)",
              height: 12,
              borderRadius: 6,
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <MotiView
              from={{ width: "0%" }}
              animate={{ width: `${porcentaje}%` }}
              transition={{ type: "timing", duration: 500 }}
              style={{
                backgroundColor: "#fff",
                height: "100%",
              }}
            />
          </View>

          <Text style={{ color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "700" }}>
            {progreso} / {desafioActual.meta} completado
          </Text>

          {/* Botones */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
            <TouchableOpacity
              onPress={completarDesafio}
              style={{
                flex: 1,
                backgroundColor: colors.success,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>✓ Marcar +1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={generarNuevoDesafio}
              style={{
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.2)",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>🔄 Cambiar</Text>
            </TouchableOpacity>
          </View>
        </MotiView>
      ) : (
        <TouchableOpacity
          onPress={generarNuevoDesafio}
          style={{
            backgroundColor: colors.primary,
            padding: 24,
            borderRadius: 20,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 50, marginBottom: 10 }}>🎲</Text>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
            Generar desafío
          </Text>
        </TouchableOpacity>
      )}

      {/* Lista de desafíos disponibles */}
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
          Ideas de desafíos
        </Text>

        {desafiosDisponibles.map((desafio, idx) => (
          <View
            key={idx}
            style={{
              backgroundColor: colors.card,
              padding: 16,
              borderRadius: 16,
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 30, marginRight: 12 }}>{desafio.emoji}</Text>
            <Text style={{ color: colors.text, flex: 1 }}>{desafio.texto}</Text>
          </View>
        ))}
      </ScrollView>

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
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
          ⬅ Volver
        </Text>
      </TouchableOpacity>
    </Container>
  );
}
