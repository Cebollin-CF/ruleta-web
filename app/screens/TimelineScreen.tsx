import React from "react";
import { Text, ScrollView, Image, View, TouchableOpacity } from "react-native";
import Container from "../components/Container"; // ❌ Quitamos Moti
import colors from "../utils/colors";

export default function TimelineScreen({ setView, eventos }) {
  return (
    <Container>
      <Text style={{ 
        color: colors.accent, 
        fontSize: 32, 
        fontWeight: "800", 
        marginBottom: 20 
      }}>
        📜 Recuerdos juntos
      </Text>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        removeClippedSubviews={true}
      >
        {eventos.map((ev, idx) => (
          <View
            key={idx}
            style={{
              backgroundColor: colors.card,
              padding: 16,
              borderRadius: 20,
              marginBottom: 20,
              borderWidth: 2,
              borderColor: "#FFFFFF20",
            }}
          >
            {/* Fecha */}
            <Text style={{ 
              color: colors.accent, 
              fontSize: 14, 
              fontWeight: "700", 
              marginBottom: 6 
            }}>
              📅 {new Date(ev.fecha).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>

            {/* Título */}
            <Text style={{ 
              color: "#FFFFFF",
              fontSize: 20, 
              fontWeight: "800", 
              marginBottom: 8 
            }}>
              {ev.titulo || "Plan sin título"}
            </Text>

            {/* Opinión */}
            {ev.opinion && (
              <Text style={{ 
                color: "#FFFFFF",
                fontSize: 14, 
                marginBottom: 10, 
                fontStyle: "italic" 
              }}>
                💭 "{ev.opinion}"
              </Text>
            )}

            {/* Puntuación */}
            {ev.puntaje > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ 
                  color: colors.warning, 
                  fontSize: 16, 
                  fontWeight: "700" 
                }}>
                  ⭐ {ev.puntaje}/10
                </Text>
              </View>
            )}

            {/* Fotos */}
            {ev.fotos && ev.fotos.length > 0 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={{ marginTop: 10 }}
              >
                {ev.fotos.map((url, i) => (
                  <Image
                    key={i}
                    source={{ uri: url }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 16,
                      marginRight: 8,
                      borderWidth: 2,
                      borderColor: colors.primary,
                    }}
                  />
                ))}
              </ScrollView>
            )}
          </View> // ❌ Cambiado MotiView por View
        ))}

        {eventos.length === 0 && (
          <Text style={{ 
            color: colors.muted, 
            textAlign: "center", 
            marginTop: 40, 
            fontSize: 16 
          }}>
            Aún no hay recuerdos guardados. ¡Empezad a crear planes juntos! 💕
          </Text>
        )}
      </ScrollView>

      {/* Botón flotante */}
      <TouchableOpacity
        onPress={() => setView("inicio")}
        activeOpacity={0.8}
        style={{
          position: "absolute",
          bottom: 30,
          left: 20,
          backgroundColor: colors.warning,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 30,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
          ⬅ Volver
        </Text>
      </TouchableOpacity>
    </Container>
  );
}