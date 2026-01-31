import React, { useState } from "react";
import { Text, TextInput, ScrollView, TouchableOpacity, View } from "react-native";
import { MotiView } from "moti";
import Container from "../components/Container";
import colors from "../utils/colors";

export default function NotasScreen({
  setView,
  notaTexto,
  setNotaTexto,
  notas,
  guardarNota,
  eliminarNota,
  editarNota,
}) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("💭 General");
  const [editandoId, setEditandoId] = useState(null);

  const categorias = [
    { emoji: "💭", nombre: "General", color: "#8B5CF6" },
    { emoji: "❤️", nombre: "Amor", color: "#FF6B9D" },
    { emoji: "🎉", nombre: "Ideas", color: "#FFD93D" },
    { emoji: "📌", nombre: "Importante", color: "#FF6B6B" },
  ];

  const guardarNotaConCategoria = () => {
    if (!notaTexto.trim()) return;

    if (editandoId) {
      editarNota(editandoId, notaTexto, categoriaSeleccionada);
      setEditandoId(null);
    } else {
      guardarNota(notaTexto, categoriaSeleccionada);
    }
    setNotaTexto("");
    setCategoriaSeleccionada("💭 General");
  };

  return (
    <Container>
      <Text style={{ color: colors.accent, fontSize: 32, fontWeight: "800", marginBottom: 20 }}>
        📝 Notas de pareja
      </Text>

      {/* Selector de categorías */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={{ marginBottom: 15, maxHeight: 50 }}
      >
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.nombre}
            onPress={() => setCategoriaSeleccionada(`${cat.emoji} ${cat.nombre}`)}
            activeOpacity={0.7}
            style={{
              backgroundColor:
                categoriaSeleccionada === `${cat.emoji} ${cat.nombre}`
                  ? cat.color
                  : "#4A3258", // ✅ Color sólido sin transparencia
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 20,
              marginRight: 10,
              borderWidth: 2,
              borderColor: categoriaSeleccionada === `${cat.emoji} ${cat.nombre}` ? "#FFFFFF" : "#6B5577",
            }}
          >
            <Text style={{ 
              color: "#FFFFFF", // ✅ Blanco puro
              fontWeight: "700",
              fontSize: 14,
            }}>
              {cat.emoji} {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input de nota */}
      <TextInput
        placeholder={`Escribe una nota (${categoriaSeleccionada})...`}
        placeholderTextColor={colors.muted}
        value={notaTexto}
        onChangeText={setNotaTexto}
        multiline
        style={{
          backgroundColor: colors.card,
          color: "#FFFFFF", // ✅ Blanco puro
          padding: 14,
          borderRadius: 20,
          marginBottom: 10,
          minHeight: 80,
          textAlignVertical: "top",
          borderWidth: 2,
          borderColor: "#6B5577",
        }}
      />

      <TouchableOpacity
        onPress={guardarNotaConCategoria}
        activeOpacity={0.8}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 20,
          alignItems: "center",
          marginBottom: 20,
          borderWidth: 2,
          borderColor: "#FFB3D1",
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>
          {editandoId ? "💾 Guardar cambios" : "💌 Guardar nota"}
        </Text>
      </TouchableOpacity>

      {/* Lista de notas - OPTIMIZADA */}
      <ScrollView 
        style={{ marginTop: 10 }} 
        contentContainerStyle={{ paddingBottom: 100 }}
        removeClippedSubviews={true} // ✅ Optimización de rendimiento
      >
        {notas.map((n, idx) => {
          const cat = categorias.find((c) => n.categoria?.includes(c.nombre));
          return (
            <MotiView
              key={n.id}
              from={{ opacity: 0, translateX: -10 }} // ✅ Menos distancia
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ 
                type: "timing", 
                duration: 150, // ✅ Más rápido (era 300)
                delay: Math.min(idx * 30, 300) // ✅ Máximo 300ms de delay
              }}
              style={{
                backgroundColor: cat?.color || "#8B5CF6",
                padding: 16,
                borderRadius: 20,
                marginBottom: 14,
                borderWidth: 2,
                borderColor: "#FFFFFF30",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14, marginBottom: 6 }}>
                {n.categoria || "💭 General"}
              </Text>

              <Text style={{ color: "#FFFFFF", fontSize: 16, marginBottom: 10 }}>
                {n.texto}
              </Text>

              <Text style={{ color: "#FFFFFFB3", fontSize: 12 }}>
                {new Date(n.fecha).toLocaleDateString()}
              </Text>

              {/* Botones de acción */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setNotaTexto(n.texto);
                    setCategoriaSeleccionada(n.categoria || "💭 General");
                    setEditandoId(n.id);
                  }}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF40",
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>✏️ Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => eliminarNota(n.id)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF20",
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 12 }}>🗑️ Borrar</Text>
                </TouchableOpacity>
              </View>
            </MotiView>
          );
        })}
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