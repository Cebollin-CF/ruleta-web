import React from "react";
import { Text, ScrollView, TouchableOpacity, View, Alert } from "react-native";
import { MotiView } from "moti";
import Container from "../components/Container";
import colors from "../utils/colors";

interface Mood {
  emoji: string;
  nombre: string;
  color: string;
}

interface MoodEntry {
  id?: string;
  emoji: string;
  nombre: string;
  fecha: string;
  usuarioId?: string;
  usuarioNombre?: string;
}

interface MoodTrackerScreenProps {
  setView: (view: string) => void;
  registrarMood: (mood: Mood) => Promise<any>;
  historialMoods: MoodEntry[];
  moodHoy: { [key: string]: MoodEntry };
  eliminarMood: (moodId: string, usuarioId: string) => Promise<any>;
  cambiarMoodHoy: () => Promise<any>;
  usuarioActual: any;
}

export default function MoodTrackerScreen({
  setView,
  registrarMood,
  historialMoods,
  moodHoy,
  eliminarMood,
  cambiarMoodHoy,
  usuarioActual,
}: MoodTrackerScreenProps) {
  const moods: Mood[] = [
    { emoji: "😍", nombre: "Enamorado/a", color: "#FF6B9D" },
    { emoji: "😊", nombre: "Feliz", color: "#FFD93D" },
    { emoji: "😌", nombre: "Tranquilo/a", color: "#6BCF7F" },
    { emoji: "😐", nombre: "Normal", color: "#95A5A6" },
    { emoji: "😔", nombre: "Triste", color: "#3498DB" },
    { emoji: "😤", nombre: "Frustrado/a", color: "#E74C3C" },
  ];

  const hoy = new Date().toISOString().split("T")[0];
  
  // Obtener mood de hoy del usuario actual
  const yaRegistradoHoy = usuarioActual 
    ? moodHoy[usuarioActual.id]
    : null;

  const handleEliminarMood = (moodId: string, usuarioId: string) => {
    Alert.alert(
      "Eliminar registro",
      "¿Seguro que quieres eliminar este registro de mood?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => eliminarMood(moodId, usuarioId),
        },
      ]
    );
  };

  const handleRegistrarMood = async (mood: Mood) => {
    if (!usuarioActual) {
      Alert.alert(
        "Usuario no seleccionado",
        "Por favor, selecciona un usuario primero",
        [{ text: "OK" }]
      );
      return;
    }
    
    const resultado = await registrarMood(mood);
    if (resultado?.success) {
      // Ya se muestra el toast desde el hook
    } else {
      Alert.alert("Error", "No se pudo registrar el mood");
    }
  };

  // Filtrar historial para mostrar solo los moods del usuario actual (o todos si no hay usuario)
  const historialFiltrado = usuarioActual
    ? (historialMoods || []).filter(mood => mood.usuarioId === usuarioActual.id)
    : (historialMoods || []);

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

      {/* Indicador de usuario actual */}
      {usuarioActual && (
        <View style={{
          backgroundColor: colors.card,
          padding: 10,
          borderRadius: 15,
          marginBottom: 15,
          alignItems: 'center',
          borderWidth: 2,
          borderColor: colors.primary,
        }}>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>
            Registrando como: {usuarioActual.nombre}
          </Text>
        </View>
      )}

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
            {usuarioActual?.nombre || "Tú"} ya registró su mood hoy
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.8)", marginTop: 4, fontSize: 16 }}>
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
            {usuarioActual 
              ? `¿Cómo te sientes hoy, ${usuarioActual.nombre}?`
              : "Selecciona cómo te sientes"}
          </Text>

          {!usuarioActual ? (
            <View style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 16,
              alignItems: 'center',
              marginBottom: 20,
              borderWidth: 2,
              borderColor: colors.warning,
            }}>
              <Text style={{ color: colors.warning, fontSize: 16, fontWeight: '700', marginBottom: 10 }}>
                ⚠️ Usuario no seleccionado
              </Text>
              <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 15 }}>
                Para registrar tu estado de ánimo, primero selecciona un usuario desde la pantalla de inicio.
              </Text>
              <TouchableOpacity
                onPress={() => setView("inicio")}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Ir a inicio</Text>
              </TouchableOpacity>
            </View>
          ) : (
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
                  onPress={() => handleRegistrarMood(mood)}
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
          )}
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
          Historial {usuarioActual ? `de ${usuarioActual.nombre}` : "general"}
        </Text>

        {historialFiltrado.slice(0, 10).map((entry, idx) => (
          <MotiView
            key={entry.id || idx}
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
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "700" }}>{entry.nombre}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>
                    {new Date(entry.fecha).toLocaleDateString()}
                  </Text>
                  {entry.usuarioNombre && (
                    <Text style={{ color: colors.muted, fontSize: 12, marginLeft: 10 }}>
                      Por: {entry.usuarioNombre}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            
            {usuarioActual && entry.usuarioId === usuarioActual.id && (
              <TouchableOpacity
                onPress={() => handleEliminarMood(entry.id || idx.toString(), entry.usuarioId || "")}
                style={{
                  backgroundColor: "rgba(255,100,100,0.2)",
                  padding: 8,
                  borderRadius: 8,
                  marginLeft: 10,
                }}
              >
                <Text style={{ color: "#FF6B6B" }}>🗑️</Text>
              </TouchableOpacity>
            )}
          </MotiView>
        ))}

        {historialFiltrado.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 30 }}>
            <Text style={{ fontSize: 50, marginBottom: 10 }}>😴</Text>
            <Text style={{ color: colors.muted, textAlign: "center", marginBottom: 5, fontSize: 16 }}>
              {usuarioActual 
                ? `${usuarioActual.nombre} aún no tiene registros de mood`
                : "Aún no hay registros. ¡Empieza a registrar cómo te sientes!"}
            </Text>
            {!usuarioActual && (
              <Text style={{ color: colors.muted, textAlign: "center", fontSize: 14 }}>
                Selecciona un usuario para empezar
              </Text>
            )}
          </View>
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