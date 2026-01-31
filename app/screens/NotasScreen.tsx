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
    { emoji: "💭", nombre: "General", color: colors.primary },
    { emoji: "❤️", nombre: "Amor", color: "#FF6B9D" },
    { emoji: "🎉", nombre: "Ideas", color: "#FFD93D" },
    { emoji: "📝", nombre: "Importante", color: "#FF6B6B" },
  ];

  const guardarNotaConCategoria = () => {
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
        📓 Notas de pareja
      </Text>

      {/* Selector de categorías */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.nombre}
            onPress={() => setCategoriaSeleccionada(`${cat.emoji} ${cat.nombre}`)}
            style={{
              backgroundColor:
                categoriaSeleccionada === `${cat.emoji} ${cat.nombre}`
                  ? cat.color
                  : "rgba(255,255,255,0.1)",
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              marginRight: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
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
          color: colors.text,
          padding: 14,
          borderRadius: 20,
          marginBottom: 10,
          minHeight: 80,
          textAlignVertical: "top",
        }}
      />

      <TouchableOpacity
        onPress={guardarNotaConCategoria}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 20,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
          {editandoId ? "💾 Guardar cambios" : "💌 Guardar nota"}
        </Text>
      </TouchableOpacity>

      {/* Lista de notas */}
      <ScrollView style={{ marginTop: 10 }}>
        {notas.map((n, idx) => {
          const cat = categorias.find((c) => n.categoria?.includes(c.nombre));
          return (
            <MotiView
              key={n.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "timing", duration: 300, delay: idx * 50 }}
              style={{
                backgroundColor: cat?.color || colors.card,
                padding: 16,
                borderRadius: 20,
                marginBottom: 14,
                position: "relative",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14, marginBottom: 6 }}>
                {n.categoria || "💭 General"}
              </Text>

              <Text style={{ color: "#fff", fontSize: 16, marginBottom: 10 }}>{n.texto}</Text>

              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
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
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>✏️ Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => eliminarNota(n.id)}
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    paddingVertical: 8,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>🗑️ Borrar</Text>
                </TouchableOpacity>
              </View>
            </MotiView>
          );
        })}
      </ScrollView>

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