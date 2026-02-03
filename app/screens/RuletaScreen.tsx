import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
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
          textAlign: "center",
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
          borderWidth: 4,
          borderColor: colors.primary,
        }}
      >
        <Text style={{ color: colors.primary, fontSize: 40 }}>🎲</Text>
      </MotiView>

      {!planActual ? (
        <View style={{ alignItems: "center" }}>
          <Boton 
            text="Girar ruleta 🎲" 
            color={colors.primary} 
            onPress={girar}
            style={{ paddingHorizontal: 40 }}
          />
          <Text style={{ 
            color: colors.muted, 
            fontSize: 14, 
            marginTop: 10,
            textAlign: "center"
          }}>
            Planes disponibles: {planes.length}
          </Text>
        </View>
      ) : (
        <>
          <View style={{
            backgroundColor: "rgba(255, 107, 157, 0.2)",
            padding: 20,
            borderRadius: 20,
            marginBottom: 20,
            alignItems: "center",
            borderWidth: 2,
            borderColor: colors.primary,
          }}>
            <Text style={{ 
              color: colors.primary, 
              fontSize: 26, 
              fontWeight: "800",
              textAlign: "center",
              marginBottom: 10,
            }}>
              {planActual.titulo}
            </Text>
            
            {planActual.precio && (
              <Text style={{ color: colors.text, fontSize: 16 }}>
                💰 Aprox: {planActual.precio}€
              </Text>
            )}
            
            {planActual.duracion && (
              <Text style={{ color: colors.text, fontSize: 16 }}>
                ⏱️ Duración: {planActual.duracion} min
              </Text>
            )}
          </View>

          <View style={{ gap: 15 }}>
            {intentosRuleta < 3 && (
              <Boton 
                text="Quiero otro 😈" 
                color={colors.secondary} 
                onPress={girar} 
              />
            )}

            <Boton 
              text="Este mola ❤️" 
              color={colors.success} 
              onPress={() => setView("calendario")} 
            />
          </View>
        </>
      )}

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