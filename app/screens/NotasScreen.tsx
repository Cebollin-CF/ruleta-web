import React, { useState, useCallback } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
  ScrollView
} from "react-native";
import Container from "../components/Container";
import colors from "../utils/colors";
import { Nota, Usuario } from "../utils/types";

interface NotasScreenProps {
  setView: (view: string) => void;
  notaTexto: string;
  setNotaTexto: (texto: string) => void;
  notas: Nota[];
  guardarNota: (texto: string, categoria: string) => Promise<boolean>;
  eliminarNota: (notaId: string) => Promise<boolean>;
  editarNota: (notaId: string, texto: string, categoria: string) => Promise<boolean>;
  usuarioActual: Usuario | null;
  mostrarToast: (mensaje: string, tipo?: 'success' | 'error' | 'warning' | 'info', emoji?: string) => void;
}

export default React.memo(function NotasScreen({
  setView,
  notaTexto,
  setNotaTexto,
  notas,
  guardarNota,
  eliminarNota,
  editarNota,
  usuarioActual,
  mostrarToast,
}: NotasScreenProps) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("💭 General");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const categorias = [
    { emoji: "💭", nombre: "General", color: "#8B5CF6" },
    { emoji: "❤️", nombre: "Amor", color: "#FF6B9D" },
    { emoji: "🎉", nombre: "Ideas", color: "#FFD93D" },
    { emoji: "📌", nombre: "Importante", color: "#FF6B6B" },
  ];

  const guardarNotaConCategoria = useCallback(async () => {
    if (!notaTexto.trim()) {
      mostrarToast("Escribe una nota primero", "warning", "⚠️");
      return;
    }

    if (!usuarioActual) {
      mostrarToast("Primero selecciona un usuario", "error", "👤");
      return;
    }

    if (editandoId) {
      const success = await editarNota(editandoId, notaTexto, categoriaSeleccionada);
      if (success) {
        setEditandoId(null);
        setNotaTexto("");
        setCategoriaSeleccionada("💭 General");
        mostrarToast("Nota actualizada", "success", "📝");
      }
    } else {
      const success = await guardarNota(notaTexto, categoriaSeleccionada);
      if (success) {
        setNotaTexto("");
        setCategoriaSeleccionada("💭 General");
        mostrarToast("Nota guardada", "success", "✨");
      }
    }
  }, [notaTexto, editandoId, categoriaSeleccionada, usuarioActual, guardarNota, editarNota, mostrarToast, setNotaTexto]);

  const handleEliminarNota = useCallback(async (notaId: string, nota: Nota) => {
    // Verificar si el usuario actual es el autor de la nota
    if (usuarioActual && nota.usuarioId !== usuarioActual.id) {
      mostrarToast("Solo el autor puede eliminar esta nota", "error", "🚫");
      return;
    }

    Alert.alert(
      "Eliminar nota",
      "¿Estás seguro de que quieres eliminar esta nota?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const success = await eliminarNota(notaId);
            if (success) {
              mostrarToast("Nota eliminada", "success", "🗑️");
            }
          },
        },
      ]
    );
  }, [usuarioActual, eliminarNota, mostrarToast]);

  const iniciarEdicion = useCallback((nota: Nota) => {
    if (usuarioActual && nota.usuarioId !== usuarioActual.id) {
      mostrarToast("Solo el autor puede editar esta nota", "error", "🚫");
      return;
    }

    setEditandoId(nota.id);
    setNotaTexto(nota.texto);
    setCategoriaSeleccionada(nota.categoria || "💭 General");
  }, [usuarioActual, setNotaTexto, mostrarToast]);

  const cancelarEdicion = useCallback(() => {
    setEditandoId(null);
    setNotaTexto("");
    setCategoriaSeleccionada("💭 General");
  }, [setNotaTexto]);

  const renderNota = useCallback((n: Nota, index: number) => {
    const cat = categorias.find((c) => n.categoria?.includes(c.nombre));

    return (
      <View
        key={n.id}
        style={[
          styles.notaContainer,
          { backgroundColor: cat?.color || "#8B5CF6" }
        ]}
      >
        <View style={styles.notaHeader}>
          <Text style={styles.notaCategoria}>
            {n.categoria || "💭 General"}
          </Text>

          {usuarioActual && n.usuarioId === usuarioActual.id && (
            <Text style={styles.notaPropia}>
              (Tú)
            </Text>
          )}
        </View>

        <Text style={styles.notaTexto}>
          {n.texto}
        </Text>

        <View style={styles.notaFooter}>
          <Text style={styles.notaFecha}>
            {new Date(n.fecha).toLocaleDateString()}
          </Text>

          {n.usuario && (
            <Text style={styles.notaUsuario}>
              Por: {n.usuario}
            </Text>
          )}
        </View>

        <View style={styles.notaBotones}>
          {(!usuarioActual || n.usuarioId === usuarioActual.id) ? (
            <>
              <TouchableOpacity
                onPress={() => iniciarEdicion(n)}
                style={styles.botonEditar}
              >
                <Text style={styles.botonTexto}>✏️ Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleEliminarNota(n.id, n)}
                style={styles.botonEliminar}
              >
                <Text style={styles.botonTexto}>🗑️ Borrar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.notaSoloAutor}>
              Solo {n.usuario} puede editar
            </Text>
          )}
        </View>
      </View>
    );
  }, [categorias, usuarioActual, iniciarEdicion, handleEliminarNota]);

  return (
    <Container>
      <Text style={styles.titulo}>
        📝 Notas de pareja
      </Text>

      {/* Indicador de usuario actual */}
      {usuarioActual && (
        <View style={styles.usuarioContainer}>
          <Text style={styles.usuarioTexto}>
            Escribiendo como: <Text style={styles.usuarioNombre}>{usuarioActual.nombre}</Text>
          </Text>
        </View>
      )}

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
      {!usuarioActual ? (
        <View style={styles.sinUsuarioContainer}>
          <Text style={styles.sinUsuarioTitulo}>
            ⚠️ Usuario no seleccionado
          </Text>
          <Text style={styles.sinUsuarioTexto}>
            Para agregar una nota, primero selecciona un usuario desde la pantalla de inicio.
          </Text>
          <TouchableOpacity
            onPress={() => setView("inicio")}
            style={styles.botonIrInicio}
          >
            <Text style={styles.botonIrInicioTexto}>Ir a inicio</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput
            placeholder={`Escribe una nota (${categoriaSeleccionada})...`}
            placeholderTextColor={colors.muted}
            value={notaTexto}
            onChangeText={setNotaTexto}
            multiline
            style={styles.inputNota}
          />

          <View style={styles.botonesAccion}>
            {editandoId && (
              <TouchableOpacity
                onPress={cancelarEdicion}
                style={styles.botonCancelar}
              >
                <Text style={styles.botonCancelarTexto}>❌ Cancelar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={guardarNotaConCategoria}
              style={styles.botonGuardar}
            >
              <Text style={styles.botonGuardarTexto}>
                {editandoId ? "💾 Guardar cambios" : "💌 Guardar nota"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Lista de notas */}
      <ScrollView style={styles.listaContainer} contentContainerStyle={styles.listaContent}>
        <Text style={styles.listaTitulo}>
          Notas ({notas.length})
        </Text>

        {notas.length === 0 ? (
          <View style={styles.sinNotasContainer}>
            <Text style={styles.sinNotasEmoji}>📝</Text>
            <Text style={styles.sinNotas}>
              {usuarioActual
                ? `${usuarioActual.nombre}, aún no has escrito notas`
                : "Aún no hay notas. ¡Escribe la primera!"}
            </Text>
            {!usuarioActual && (
              <Text style={styles.sinNotasSubtexto}>
                Selecciona un usuario para empezar
              </Text>
            )}
          </View>
        ) : (
          notas.map((n, index) => renderNota(n, index))
        )}
      </ScrollView>

      {/* Botón volver */}
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
    marginBottom: 15,
    textAlign: 'center',
  },
  usuarioContainer: {
    backgroundColor: colors.card,
    padding: 10,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  usuarioTexto: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  usuarioNombre: {
    color: colors.primary,
  },
  categoriasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    gap: 8,
    justifyContent: 'center',
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
  sinUsuarioContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: colors.warning,
    alignItems: 'center',
  },
  sinUsuarioTitulo: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  sinUsuarioTexto: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  botonIrInicio: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  botonIrInicioTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
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
  botonesAccion: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  botonGuardar: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFB3D1",
  },
  botonCancelar: {
    backgroundColor: colors.muted,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.muted,
  },
  botonGuardarTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  botonCancelarTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  listaContainer: {
    flex: 1,
    marginTop: 10,
  },
  listaContent: {
    paddingBottom: 100,
  },
  listaTitulo: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  sinNotasContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  sinNotasEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  sinNotas: {
    color: colors.muted,
    textAlign: "center",
    marginBottom: 5,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  sinNotasSubtexto: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 14,
  },
  notaContainer: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF30",
  },
  notaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notaCategoria: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  notaPropia: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  notaTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  notaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  notaFecha: {
    color: "#FFFFFFB3",
    fontSize: 12,
  },
  notaUsuario: {
    color: "#FFFFFFB3",
    fontSize: 12,
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
  notaSoloAutor: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'center',
    flex: 1,
    fontStyle: 'italic',
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