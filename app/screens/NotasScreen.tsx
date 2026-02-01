import React, { useState, useCallback } from "react";
import { Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import Container from "../components/Container";
import colors from "../utils/colors";

export default React.memo(function NotasScreen({
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

  const guardarNotaConCategoria = useCallback(() => {
    if (!notaTexto.trim()) return;

    if (editandoId) {
      editarNota(editandoId, notaTexto, categoriaSeleccionada);
      setEditandoId(null);
    } else {
      guardarNota(notaTexto, categoriaSeleccionada);
    }
    setNotaTexto("");
    setCategoriaSeleccionada("💭 General");
  }, [notaTexto, editandoId, categoriaSeleccionada]);

  const renderNota = useCallback(({ item: n }) => {
    const cat = categorias.find((c) => n.categoria?.includes(c.nombre));
    
    return (
      <View
        key={n.id}
        style={[
          styles.notaContainer,
          { backgroundColor: cat?.color || "#8B5CF6" }
        ]}
      >
        <Text style={styles.notaCategoria}>
          {n.categoria || "💭 General"}
        </Text>

        <Text style={styles.notaTexto}>
          {n.texto}
        </Text>

        <Text style={styles.notaFecha}>
          {new Date(n.fecha).toLocaleDateString()}
        </Text>

        <View style={styles.notaBotones}>
          <TouchableOpacity
            onPress={() => {
              setNotaTexto(n.texto);
              setCategoriaSeleccionada(n.categoria || "💭 General");
              setEditandoId(n.id);
            }}
            style={styles.botonEditar}
          >
            <Text style={styles.botonTexto}>✏️ Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => eliminarNota(n.id)}
            style={styles.botonEliminar}
          >
            <Text style={styles.botonTexto}>🗑️ Borrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [categorias, setNotaTexto, setCategoriaSeleccionada]);

  return (
    <Container>
      <Text style={styles.titulo}>
        📝 Notas de pareja
      </Text>

      {/* Selector de categorías */}
      <View style={styles.categoriasContainer}>
        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.nombre}
            onPress={() => setCategoriaSeleccionada(`${cat.emoji} ${cat.nombre}`)}
            style={[
              styles.categoriaBoton,
              {
                backgroundColor:
                  categoriaSeleccionada === `${cat.emoji} ${cat.nombre}`
                    ? cat.color
                    : "#4A3258",
                borderColor: categoriaSeleccionada === `${cat.emoji} ${cat.nombre}` 
                  ? "#FFFFFF" 
                  : "#6B5577",
              }
            ]}
          >
            <Text style={styles.categoriaTexto}>
              {cat.emoji} {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input de nota */}
      <TextInput
        placeholder={`Escribe una nota (${categoriaSeleccionada})...`}
        placeholderTextColor={colors.muted}
        value={notaTexto}
        onChangeText={setNotaTexto}
        multiline
        style={styles.inputNota}
      />

      <TouchableOpacity
        onPress={guardarNotaConCategoria}
        style={styles.botonGuardar}
      >
        <Text style={styles.botonGuardarTexto}>
          {editandoId ? "💾 Guardar cambios" : "💌 Guardar nota"}
        </Text>
      </TouchableOpacity>

      {/* Lista de notas OPTIMIZADA */}
      <View style={styles.listaContainer}>
        {notas.length === 0 ? (
          <Text style={styles.sinNotas}>
            Aún no hay notas. ¡Escribe la primera! 💕
          </Text>
        ) : (
          notas.map((n, index) => renderNota({ item: n, index }))
        )}
      </View>

      {/* Botón flotante */}
      <TouchableOpacity
        onPress={() => setView("inicio")}
        style={styles.botonVolver}
      >
        <Text style={styles.botonVolverTexto}>
          ⬅ Volver
        </Text>
      </TouchableOpacity>
    </Container>
  );
});

const styles = StyleSheet.create({
  titulo: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 20,
  },
  categoriasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    gap: 8,
  },
  categoriaBoton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
  },
  categoriaTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  inputNota: {
    backgroundColor: colors.card,
    color: "#FFFFFF",
    padding: 14,
    borderRadius: 20,
    marginBottom: 10,
    minHeight: 80,
    textAlignVertical: "top",
    borderWidth: 2,
    borderColor: "#6B5577",
    fontSize: 16,
  },
  botonGuardar: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFB3D1",
  },
  botonGuardarTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  listaContainer: {
    flex: 1,
    marginTop: 10,
    paddingBottom: 100,
  },
  notaContainer: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF30",
  },
  notaCategoria: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 6,
  },
  notaTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  notaFecha: {
    color: "#FFFFFFB3",
    fontSize: 12,
    marginBottom: 12,
  },
  notaBotones: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  botonEditar: {
    flex: 1,
    backgroundColor: "#FFFFFF40",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  botonEliminar: {
    flex: 1,
    backgroundColor: "#FFFFFF20",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  botonTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  sinNotas: {
    color: colors.muted,
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  botonVolver: {
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
  },
  botonVolverTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});