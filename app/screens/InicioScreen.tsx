import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image, ScrollView } from "react-native";
import Container from "../components/Container";
import colors from "../utils/colors";
import { MotiView } from "moti";

export default function InicioScreen({
  setView,
  coupleId,
  avatarUrl,
  fechaAniversario,
  razonDelDia,
}) {
  const [diasJuntos, setDiasJuntos] = useState(0);
  const [confeti, setConfeti] = useState(false);

  useEffect(() => {
    if (fechaAniversario) {
      const inicio = new Date(fechaAniversario);
      const hoy = new Date();
      const diferencia = Math.floor((hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
      setDiasJuntos(diferencia);

      // Confeti en hitos especiales
      if ([100, 365, 500, 730, 1000].includes(diferencia)) {
        setConfeti(true);
        setTimeout(() => setConfeti(false), 3000);
      }
    }
  }, [fechaAniversario]);

  return (
    <Container>
      {/* Confeti animado */}
      {confeti && (
        <MotiView
          from={{ opacity: 0, translateY: -50 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: "timing", duration: 2000 }}
          style={{
            position: "absolute",
            top: 50,
            left: 0,
            right: 0,
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <Text style={{ fontSize: 100 }}>🎉</Text>
        </MotiView>
      )}

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* AVATAR DE PAREJA */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 600 }}
          style={{ alignItems: "center", marginBottom: 20, marginTop: 10 }}
        >
          <TouchableOpacity onPress={() => setView("avatar")}>
            {avatarUrl ? (
              <View>
                <Image
                  source={{ uri: avatarUrl }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    borderWidth: 4,
                    borderColor: colors.primary,
                  }}
                />
                {/* Corazones flotantes al tocar */}
                <MotiView
                  from={{ opacity: 0, translateY: 0 }}
                  animate={{ opacity: [0, 1, 0], translateY: -30 }}
                  transition={{
                    loop: true,
                    type: "timing",
                    duration: 2000,
                  }}
                  style={{ position: "absolute", top: -10, right: -10 }}
                >
                  <Text style={{ fontSize: 24 }}>💕</Text>
                </MotiView>
              </View>
            ) : (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: colors.card,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 3,
                  borderColor: colors.muted,
                  borderStyle: "dashed",
                }}
              >
                <Text style={{ fontSize: 40 }}>💑</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* CONTADOR DE DÍAS */}
          {fechaAniversario && (
            <Text
              style={{
                color: colors.accent,
                fontSize: 16,
                fontWeight: "700",
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Lleváis juntos {diasJuntos} días 💕
            </Text>
          )}
        </MotiView>

        {/* RAZÓN DEL DÍA */}
        {razonDelDia && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 200 }}
            style={{
              backgroundColor: `rgba(255, 79, 139, 0.9)`,
              padding: 16,
              borderRadius: 20,
              marginBottom: 20,
              borderWidth: 2,
              borderColor: "#FFB3D1",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 6 }}>
              💝 Razón del día
            </Text>
            <Text style={{ color: "#fff", fontSize: 15, fontStyle: "italic" }}>
              "{razonDelDia.texto}"
            </Text>
          </MotiView>
        )}

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
              textShadowColor: "rgba(255, 179, 209, 0.5)",
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 5,
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

        {/* BOTÓN PRINCIPAL - ESTILO ESPECIAL */}
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 800 }}
        >
          <TouchableOpacity
            onPress={() => setView("ruleta")}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 18,
              paddingHorizontal: 30,
              borderRadius: 25,
              alignItems: "center",
              marginBottom: 20,
              borderWidth: 3,
              borderColor: "#FFB3D1",
              shadowColor: colors.primary,
              shadowOpacity: 0.5,
              shadowRadius: 15,
              elevation: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900" }}>
              🎡 ELEGIR PLAN
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, marginTop: 4 }}>
              Gira la ruleta y sorpréndete
            </Text>
          </TouchableOpacity>
        </MotiView>

        {/* BOTONES FILA 1: NUEVO + CALENDARIO - ESTILO TARJETA */}
        <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
          <TouchableOpacity
            onPress={() => setView("nuevo")}
            style={{
              flex: 1,
              backgroundColor: `rgba(178, 141, 255, 0.9)`,
              paddingVertical: 16,
              paddingHorizontal: 12,
              borderRadius: 18,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#D4BFFF",
              shadowColor: "#B28DFF",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 28, marginBottom: 5 }}>✨</Text>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14, textAlign: "center" }}>
              Nuevo Plan
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 2 }}>
              Crear una idea
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setView("calendario")}
            style={{
              flex: 1,
              backgroundColor: `rgba(107, 209, 138, 0.9)`,
              paddingVertical: 16,
              paddingHorizontal: 12,
              borderRadius: 18,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#A3E4B5",
              shadowColor: "#6BD18A",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 28, marginBottom: 5 }}>📅</Text>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14, textAlign: "center" }}>
              Calendario
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 2 }}>
              Ver fechas
            </Text>
          </TouchableOpacity>
        </View>

        {/* BOTONES FILA 2: TIMELINE + NOTAS - ESTILO TARJETA */}
        <View style={{ flexDirection: "row", marginTop: 12, gap: 10 }}>
          <TouchableOpacity
            onPress={() => setView("timeline")}
            style={{
              flex: 1,
              backgroundColor: `rgba(160, 83, 122, 0.9)`,
              paddingVertical: 16,
              paddingHorizontal: 12,
              borderRadius: 18,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#D495B8",
              shadowColor: "#A0537A",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 28, marginBottom: 5 }}>📜</Text>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14, textAlign: "center" }}>
              Recuerdos
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 2 }}>
              Nuestra historia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setView("notas")}
            style={{
              flex: 1,
              backgroundColor: `rgba(247, 197, 109, 0.9)`,
              paddingVertical: 16,
              paddingHorizontal: 12,
              borderRadius: 18,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#FADAA5",
              shadowColor: "#F7C56D",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 28, marginBottom: 5 }}>📓</Text>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14, textAlign: "center" }}>
              Notas
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 2 }}>
              Apuntes de amor
            </Text>
          </TouchableOpacity>
        </View>

        {/* BOTONES FILA 3: RAZONES + DESAFÍOS - ESTILO TARJETA */}
        <View style={{ flexDirection: "row", marginTop: 12, gap: 10 }}>
          <TouchableOpacity
            onPress={() => setView("razones")}
            style={{
              flex: 1,
              backgroundColor: `rgba(255, 107, 157, 0.9)`,
              paddingVertical: 16,
              paddingHorizontal: 12,
              borderRadius: 18,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#FFC1D6",
              shadowColor: "#FF6B9D",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 28, marginBottom: 5 }}>💝</Text>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14, textAlign: "center" }}>
              Razones
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 2 }}>
              Por qué te amo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setView("desafios")}
            style={{
              flex: 1,
              backgroundColor: `rgba(155, 89, 182, 0.9)`,
              paddingVertical: 16,
              paddingHorizontal: 12,
              borderRadius: 18,
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#C39BD3",
              shadowColor: "#9B59B6",
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text style={{ fontSize: 28, marginBottom: 5 }}>🎯</Text>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14, textAlign: "center" }}>
              Desafíos
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 2 }}>
              Retos de pareja
            </Text>
          </TouchableOpacity>
        </View>

        {/* BOTÓN MOOD TRACKER - ESTILO ESPECIAL */}
        <TouchableOpacity
          onPress={() => setView("mood")}
          style={{
            marginTop: 15,
            marginBottom: 20,
            backgroundColor: `rgba(52, 152, 219, 0.9)`,
            paddingVertical: 16,
            paddingHorizontal: 20,
            borderRadius: 20,
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#85C1E9",
            shadowColor: "#3498DB",
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 24, marginRight: 10 }}>😊</Text>
          <View>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
              ¿Cómo te sientes hoy?
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 2 }}>
              Comparte tu estado de ánimo
            </Text>
          </View>
        </TouchableOpacity>

        {/* INFO DE PAREJA */}
        <View style={{ marginTop: 10, alignItems: "center", marginBottom: 30 }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Pareja vinculada:</Text>

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

          <TouchableOpacity 
            onPress={() => setView("vinculo")}
            style={{
              marginTop: 8,
              backgroundColor: "rgba(255,255,255,0.1)",
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: colors.muted,
            }}
          >
            <Text
              style={{
                color: colors.secondary,
                fontWeight: "700",
                fontSize: 12,
              }}
            >
              🔗 Gestionar vínculo
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}