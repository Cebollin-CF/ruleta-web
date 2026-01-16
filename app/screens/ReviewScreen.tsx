import React from "react";
import {
  Text,
  ScrollView,
  Image,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import Container from "../components/Container";
import Boton from "../components/Boton";
import colors from "../utils/colors";
import { MotiView } from "moti";

export default function ReviewScreen({
  setView,
  fechaSeleccionada,
  lista,
  actualizarPlan,
  subirFoto,
  planes,
}) {
  const getPlanInfo = (planId) => planes.find((p) => p.id === planId);

  return (
    <Container>
      <ScrollView>
        <Text
          style={{
            color: colors.accent,
            fontSize: 32,
            fontWeight: "800",
            marginBottom: 20,
          }}
        >
          Planes del día {fechaSeleccionada}
        </Text>

        {lista.map((p, i) => {
          const planInfo = getPlanInfo(p.planId);

          return (
            <MotiView
              key={i}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 350 }}
              style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 20,
                marginBottom: 20,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              {/* TÍTULO DEL PLAN */}
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 22,
                  fontWeight: "800",
                  marginBottom: 10,
                }}
              >
                {planInfo?.titulo}
              </Text>

              {/* OPINIÓN */}
              <TextInput
                placeholder="Opinión"
                placeholderTextColor={colors.muted}
                value={p.opinion || ""}
                onChangeText={(text) => actualizarPlan(i, { opinion: text })}
                style={{
                  backgroundColor: "#f3edf7",
                  color: colors.text,
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 10,
                }}
              />

              {/* PUNTUACIÓN */}
              <TextInput
                placeholder="Puntuación (0-10)"
                placeholderTextColor={colors.muted}
                value={String(p.puntaje || "")}
                onChangeText={(text) =>
                  actualizarPlan(i, { puntaje: Number(text) || 0 })
                }
                keyboardType="numeric"
                style={{
                  backgroundColor: "#f3edf7",
                  color: colors.text,
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 10,
                }}
              />

              {/* BOTÓN AÑADIR FOTO */}
              <Boton
                text="Añadir foto 📸"
                color={colors.secondary}
                onPress={() => subirFoto(i)}
              />

              {/* FOTOS */}
              <ScrollView horizontal style={{ marginTop: 10 }}>
                {(p.fotos || []).map((fotoUrl, idx) => (
                  <MotiView
                    key={idx}
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "timing", duration: 300 }}
                  >
                    <Image
                      source={{ uri: fotoUrl }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 16,
                        marginRight: 8,
                      }}
                    />
                  </MotiView>
                ))}
              </ScrollView>
            </MotiView>
          );
        })}

        <Boton
          text="⬅ Volver"
          color={colors.warning}
          onPress={() => setView("inicio")}
        />
      </ScrollView>
    </Container>
  );
}
