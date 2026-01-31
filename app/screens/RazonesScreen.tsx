import React, { useState } from "react";
import { Text, TextInput, ScrollView, TouchableOpacity, View, Alert } from "react-native";
import { MotiView } from "moti";
import Container from "../components/Container";
import colors from "../utils/colors";

export default function RazonesScreen({
  setView,
  razones,
  agregarRazon,
  eliminarRazon,
  razonDelDia,
  editarRazon,
}) {
  const [nuevaRazon, setNuevaRazon] = useState("");

  const handleAgregarRazon = () => {
    console.log("handleAgregarRazon llamado");
    console.log("Texto actual:", nuevaRazon);
    
    if (!nuevaRazon.trim()) {
      Alert.alert("Campo vacío", "Escribe una razón primero");
      return;
    }
    
    console.log("Llamando a agregarRazon con:", nuevaRazon.trim());
    agregarRazon(nuevaRazon.trim());
    setNuevaRazon("");
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
        💝 Razones para quererse
      </Text>

      {/* Razón del día */}
      {razonDelDia && (
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "timing", duration: 500 }}
          style={{
            backgroundColor: colors.primary,
            padding: 20,
            borderRadius: 20,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
            💕 Razón del día
          </Text>
          <Text style={{ color: "#fff", fontSize: 18, textAlign: "center", fontStyle: "italic" }}>
            "{razonDelDia.texto}"
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 8 }}>
            Por: {razonDelDia.autor}
          </Text>
        </MotiView>
      )}

      {/* Input nueva razón */}
      <TextInput
        placeholder="Escribe una razón..."
        placeholderTextColor={colors.muted}
        value={nuevaRazon}
        onChangeText={setNuevaRazon}
        multiline
        style={{
          backgroundColor: colors.card,
          color: colors.text,
          padding: 14,
          borderRadius: 20,
          marginBottom: 10,
          minHeight: 60,
          textAlignVertical: "top",
          borderWidth: 1,
          borderColor: colors.primary,
        }}
      />

      <TouchableOpacity
        onPress={handleAgregarRazon}
        style={{
          backgroundColor: colors.secondary,
          paddingVertical: 14,
          borderRadius: 20,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
          ➕ Agregar razón
        </Text>
      </TouchableOpacity>

      {/* Lista de razones */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
          Todas las razones ({razones.length})
        </Text>

        {razones.map((razon, idx) => (
          <MotiView
            key={razon.id}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: "timing", duration: 300, delay: idx * 50 }}
            style={{
              backgroundColor: colors.card,
              padding: 16,
              borderRadius: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 16, marginBottom: 4 }}>
                {razon.texto}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                Por: {razon.autor} • {new Date(razon.fecha).toLocaleDateString()}
              </Text>
            </View>

            {/* Botón eliminar */}
            <TouchableOpacity
              onPress={() => eliminarRazon(razon.id)}
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

        {razones.length === 0 && (
          <Text style={{ color: colors.muted, textAlign: "center", marginTop: 20, fontSize: 16 }}>
            Aún no tienes razones. ¡Agrega la primera! 💕
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