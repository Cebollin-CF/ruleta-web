import React, { useState } from "react";
import { Text, TextInput, ScrollView, TouchableOpacity, View, Alert } from "react-native";
import { MotiView } from "moti";
import Container from "../components/Container";
import colors from "../utils/colors";

interface Razon {
  id: string;
  texto: string;
  autor: string;
  autorId?: string;
  fecha: string;
  usuarioNumero?: number;
}

interface RazonesScreenProps {
  setView: (view: string) => void;
  razones: Razon[];
  agregarRazon: (texto: string) => Promise<any>;
  eliminarRazon: (razonId: string) => Promise<any>;
  razonDelDia: Razon | null;
  editarRazon: (razonId: string, nuevoTexto: string) => Promise<any>;
  usuarioActual: any;
}

export default function RazonesScreen({
  setView,
  razones,
  agregarRazon,
  eliminarRazon,
  razonDelDia,
  editarRazon,
  usuarioActual,
}: RazonesScreenProps) {
  const [nuevaRazon, setNuevaRazon] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEditando, setTextoEditando] = useState("");

  const handleAgregarRazon = async () => {
    if (!nuevaRazon.trim()) {
      Alert.alert("Campo vacío", "Escribe una razón primero");
      return;
    }

    if (!usuarioActual) {
      Alert.alert(
        "Usuario no seleccionado",
        "Por favor, selecciona un usuario primero para agregar una razón",
        [{ text: "OK" }]
      );
      return;
    }
    
    const resultado = await agregarRazon(nuevaRazon.trim());
    if (resultado?.success) {
      setNuevaRazon("");
    } else if (resultado?.error) {
      Alert.alert("Error", resultado.error);
    }
  };

  const handleEliminarRazon = async (razonId: string, razon: Razon) => {
    // Verificar si el usuario actual es el autor de la razón
    if (usuarioActual && razon.autorId !== usuarioActual.id) {
      Alert.alert(
        "No autorizado",
        "Solo el autor puede eliminar esta razón",
        [{ text: "Entendido" }]
      );
      return;
    }

    Alert.alert(
      "Eliminar razón",
      "¿Estás seguro de que quieres eliminar esta razón?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const resultado = await eliminarRazon(razonId);
            if (!resultado?.success && resultado?.error) {
              Alert.alert("Error", resultado.error);
            }
          },
        },
      ]
    );
  };

  const iniciarEdicion = (razon: Razon) => {
    if (usuarioActual && razon.autorId !== usuarioActual.id) {
      Alert.alert(
        "No autorizado",
        "Solo el autor puede editar esta razón",
        [{ text: "Entendido" }]
      );
      return;
    }
    
    setEditandoId(razon.id);
    setTextoEditando(razon.texto);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTextoEditando("");
  };

  const guardarEdicion = async () => {
    if (!editandoId || !textoEditando.trim()) return;
    
    const resultado = await editarRazon(editandoId, textoEditando.trim());
    if (resultado?.success) {
      setEditandoId(null);
      setTextoEditando("");
    } else if (resultado?.error) {
      Alert.alert("Error", resultado.error);
    }
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
        💍 Razones para quererse
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
            Escribiendo como: {usuarioActual.nombre}
          </Text>
        </View>
      )}

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
            borderWidth: 2,
            borderColor: "#FFB3D1",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
            💕 Razón del día
          </Text>
          <Text style={{ color: "#fff", fontSize: 18, textAlign: "center", fontStyle: "italic" }}>
            "{razonDelDia.texto}"
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 8 }}>
            Por: {razonDelDia.autor || 'Usuario'}
          </Text>
        </MotiView>
      )}

      {/* Input nueva razón */}
      {!usuarioActual ? (
        <View style={{
          backgroundColor: colors.card,
          padding: 20,
          borderRadius: 16,
          marginBottom: 15,
          borderWidth: 2,
          borderColor: colors.warning,
        }}>
          <Text style={{ color: colors.warning, fontSize: 16, fontWeight: '700', marginBottom: 10 }}>
            ⚠️ Usuario no seleccionado
          </Text>
          <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 15 }}>
            Para agregar una razón, primero selecciona un usuario desde la pantalla de inicio.
          </Text>
          <TouchableOpacity
            onPress={() => setView("inicio")}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 12,
              alignSelf: 'center',
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Ir a inicio</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput
            placeholder={`Escribe una razón, ${usuarioActual.nombre}...`}
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
              borderWidth: 2,
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
              borderWidth: 2,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              ➕ Agregar razón
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Lista de razones */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
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
              borderWidth: 2,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            {editandoId === razon.id ? (
              // Modo edición
              <View>
                <TextInput
                  value={textoEditando}
                  onChangeText={setTextoEditando}
                  multiline
                  style={{
                    backgroundColor: colors.bgBottom,
                    color: colors.text,
                    padding: 10,
                    borderRadius: 10,
                    marginBottom: 10,
                    minHeight: 60,
                    textAlignVertical: "top",
                    borderWidth: 2,
                    borderColor: colors.primary,
                  }}
                />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={guardarEdicion}
                    style={{
                      flex: 1,
                      backgroundColor: colors.success,
                      paddingVertical: 8,
                      borderRadius: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>💾 Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={cancelarEdicion}
                    style={{
                      flex: 1,
                      backgroundColor: colors.muted,
                      paddingVertical: 8,
                      borderRadius: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>❌ Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Modo visualización
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 16, marginBottom: 4 }}>
                    {razon.texto}
                  </Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      Por: {razon.autor || 'Usuario'} • {new Date(razon.fecha).toLocaleDateString()}
                    </Text>
                    
                    {/* Indicador de usuario actual */}
                    {usuarioActual && razon.autorId === usuarioActual.id && (
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>
                        (Tú)
                      </Text>
                    )}
                  </View>
                </View>

                {/* Botones de acción */}
                <View style={{ flexDirection: "row", gap: 8, marginLeft: 10 }}>
                  {(!usuarioActual || razon.autorId === usuarioActual.id) && (
                    <>
                      <TouchableOpacity
                        onPress={() => iniciarEdicion(razon)}
                        style={{
                          backgroundColor: "rgba(178, 141, 255, 0.2)",
                          padding: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: colors.secondary }}>✏️</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={() => handleEliminarRazon(razon.id, razon)}
                        style={{
                          backgroundColor: "rgba(255,100,100,0.2)",
                          padding: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: "#FF6B6B" }}>🗑️</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  {usuarioActual && razon.autorId !== usuarioActual.id && (
                    <Text style={{ color: colors.muted, fontSize: 10, alignSelf: 'center', paddingHorizontal: 5 }}>
                      Solo {razon.autor}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </MotiView>
        ))}

        {razones.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 30 }}>
            <Text style={{ fontSize: 50, marginBottom: 10 }}>💝</Text>
            <Text style={{ color: colors.muted, textAlign: "center", marginBottom: 5, fontSize: 16 }}>
              {usuarioActual 
                ? `${usuarioActual.nombre}, aún no has escrito razones`
                : "Aún no hay razones. ¡Agrega la primera!"}
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