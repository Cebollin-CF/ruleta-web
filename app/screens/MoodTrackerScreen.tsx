import React from "react";
import { Text, ScrollView, TouchableOpacity, View, Alert } from "react-native";
import { MotiView } from "moti";
import Container from "../components/Container";
import colors from "../utils/colors";

export default function MoodTrackerScreen({
  setView,
  registrarMood,
  historialMoods,
  moodHoy,
  eliminarMood,
  cambiarMoodHoy,
}) {
  const moods = [
    { emoji: "😍", nombre: "Enamorado/a", color: "#FF6B9D" },
    { emoji: "😊", nombre: "Feliz", color: "#FFD93D" },
    { emoji: "😌", nombre: "Tranquilo/a", color: "#6BCF7F" },
    { emoji: "😐", nombre: "Normal", color: "#95A5A6" },
    { emoji: "😔", nombre: "Triste", color: "#3498DB" },
    { emoji: "😤", nombre: "Frustrado/a", color: "#E74C3C" },
  ];

  const hoy = new Date().toISOString().split("T")[0];
  const yaRegistradoHoy = moodHoy?.[hoy];

  const handleEliminarMood = (fecha, index) => {
    Alert.alert(
      "Eliminar registro",
      "¿Seguro que quieres eliminar este registro de mood?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => eliminarMood(fecha, index),
        },
      ]
    );
  };

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
        😊 ¿Cómo te sientes hoy?
      </Text>

      {yaRegistradoHoy ? (
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            backgroundColor: colors.success,
            padding: 20,
            borderRadius: 20,
            marginBottom: 20,
            alignItems: "center",
            position: "relative",
          }}
        >
          <Text style={{ fontSize: 60 }}>{yaRegistradoHoy.emoji}</Text>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 10 }}>
            Ya registraste tu mood hoy
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
            {yaRegistradoHoy.nombre}
          </Text>
          
          <TouchableOpacity
            onPress={() => cambiarMoodHoy()}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "rgba(255,255,255,0.2)",
              padding: 8,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12 }}>🔄 Cambiar</Text>
          </TouchableOpacity>
        </MotiView>
      ) : (
        <View style={{ marginBottom: 30 }}>
          <Text style={{ color: colors.text, fontSize: 16, marginBottom: 14, textAlign: "center" }}>
            Selecciona cómo te sientes
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.nombre}
                onPress={() => registrarMood(mood)}
                style={{
                  backgroundColor: colors.card,
                  width: 100,
                  padding: 16,
                  borderRadius: 16,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: mood.color,
                }}
              >
                <Text style={{ fontSize: 40, marginBottom: 8 }}>{mood.emoji}</Text>
                <Text style={{ color: colors.text, fontSize: 12, textAlign: "center" }}>
                  {mood.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
          Historial reciente
        </Text>

        {(historialMoods || []).slice(0, 10).map((entry, idx) => (
          <MotiView
            key={idx}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: "timing", duration: 300, delay: idx * 50 }}
            style={{
              backgroundColor: colors.card,
              padding: 16,
              borderRadius: 16,
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>{entry.emoji}</Text>
              <View>
                <Text style={{ color: colors.text, fontWeight: "700" }}>{entry.nombre}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {new Date(entry.fecha).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={() => handleEliminarMood(entry.fecha, idx)}
              style={{
                backgroundColor: "rgba(255,100,100,0.2)",
                padding: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#FF6B6B" }}>🗑️</Text>
            </TouchableOpacity>
          </MotiView>
        ))}

        {(!historialMoods || historialMoods.length === 0) && (
          <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20 }}>
            Aún no hay registros. ¡Empieza a registrar cómo te sientes!
          </Text>
        )}
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