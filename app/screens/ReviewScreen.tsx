import { MotiView } from "moti";
import React from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../supabaseClient";
import Boton from "../components/Boton";
import Container from "../components/Container";
import colors from "../utils/colors";

export default function ReviewScreen({
  setView,
  fechaSeleccionada,
  lista,
  actualizarPlan,
  subirFoto,
  planes,
  setPlanes,
  coupleId,
  planesPorDia,
  notas,
  eliminarPlanEnFecha,
  mostrarToast,
}) {
  const getPlanInfo = (planId) => planes.find((p) => p.id === planId);

  const marcarComoCompletado = async (planId, indexEnDia) => {
    actualizarPlan(indexEnDia, { completado: true });

    const nuevosPlanes = planes.map((p) =>
      p.id === planId ? { ...p, completado: true } : p
    );

    setPlanes(nuevosPlanes);

    try {
      await supabase
        .from("app_state")
        .update({
          contenido: {
            planes: nuevosPlanes,
            planesPorDia,
            notas,
          },
        })
        .eq("id", coupleId);
    } catch (error) {
      console.error("Error guardando en Supabase:", error);
    }
  };

  // Depuración: mostrar props recibidas
  console.log("ReviewScreen props:", {
    fechaSeleccionada,
    listaLength: lista?.length,
    eliminarPlanEnFecha: typeof eliminarPlanEnFecha,
    mostrarToast: typeof mostrarToast,
  });

  return (
    <Container>
      <ScrollView>
        <Text
          style={{
            color: colors.accent,
            fontSize: 32,
            fontWeight: "800",
            marginBottom: 20,
          }}
        >
          Planes del día {fechaSeleccionada}
        </Text>

        {lista.map((p, i) => {
          const planInfo = getPlanInfo(p.planId);

          return (
            <MotiView
              key={`${p.planId ?? "plan"}-${i}`}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 350 }}
              style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 20,
                marginBottom: 20,
                position: "relative",
              }}
            >
              {/* Botón BORRAR en la esquina superior derecha */}
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 20,
                  elevation: 20,
                }}
                pointerEvents="box-none"
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => {
                    console.log("ReviewScreen: onPress ✕ (inicio) - índice:", i);

                    // Fallback para web: usar window.confirm
                    if (Platform.OS === "web") {
                      const ok = window.confirm(
                        "¿Seguro que quieres eliminar este plan de la fecha?"
                      );
                      console.log("ReviewScreen: web confirm result:", ok);
                      if (!ok) return;

                      (async () => {
                        console.log("ReviewScreen: confirmar eliminar i:", i);
                        try {
                          if (typeof eliminarPlanEnFecha === "function") {
                            await eliminarPlanEnFecha(i);
                            console.log("ReviewScreen: eliminarPlanEnFecha OK (web)");
                          } else {
                            console.warn(
                              "ReviewScreen: eliminarPlanEnFecha no está definido"
                            );
                          }
                          if (typeof mostrarToast === "function")
                            mostrarToast("Plan eliminado");
                        } catch (err) {
                          console.error("ReviewScreen: error al eliminar (web)", err);
                          if (typeof mostrarToast === "function")
                            mostrarToast("Error al eliminar");
                        }
                      })();

                      return;
                    }

                    // Móvil / nativo: usar Alert.alert
                    Alert.alert(
                      "Eliminar plan",
                      "¿Seguro que quieres eliminar este plan de la fecha?",
                      [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Eliminar",
                          style: "destructive",
                          onPress: async () => {
                            console.log("ReviewScreen: confirmar eliminar i:", i);
                            try {
                              if (typeof eliminarPlanEnFecha === "function") {
                                await eliminarPlanEnFecha(i);
                                console.log(
                                  "ReviewScreen: eliminarPlanEnFecha OK (nativo)"
                                );
                              } else {
                                console.warn(
                                  "ReviewScreen: eliminarPlanEnFecha no está definido"
                                );
                              }
                              if (typeof mostrarToast === "function")
                                mostrarToast("Plan eliminado");
                            } catch (err) {
                              console.error(
                                "ReviewScreen: error al eliminar (nativo)",
                                err
                              );
                              if (typeof mostrarToast === "function")
                                mostrarToast("Error al eliminar");
                            }
                          },
                        },
                      ],
                      { cancelable: true }
                    );
                  }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.muted, fontWeight: "700" }}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TÍTULO (tachado si completado) */}
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 22,
                  fontWeight: "800",
                  marginBottom: 10,
                  textDecorationLine: p.completado ? "line-through" : "none",
                }}
              >
                {planInfo?.titulo ?? "Plan"}
              </Text>

              {/* BOTÓN COMPLETAR (solo si NO está completado) */}
              {!p.completado && (
                <TouchableOpacity
                  onPress={() => marcarComoCompletado(p.planId, i)}
                  style={{
                    padding: 10,
                    backgroundColor: colors.muted,
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>
                    Marcar como completado
                  </Text>
                </TouchableOpacity>
              )}

              {/* OPINIÓN */}
              <TextInput
                placeholder="Opinión"
                placeholderTextColor={colors.muted}
                value={p.opinion || ""}
                onChangeText={(text) => actualizarPlan(i, { opinion: text })}
                style={{
                  backgroundColor: "#f8f8f8",
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 10,
                }}
              />

              {/* PUNTUACIÓN */}
              <TextInput
                placeholder="Puntuación (0-10)"
                placeholderTextColor={colors.muted}
                value={String(p.puntaje || "")}
                onChangeText={(text) =>
                  actualizarPlan(i, { puntaje: Number(text) || 0 })
                }
                keyboardType="numeric"
                style={{
                  backgroundColor: "rgb(243, 237, 247)",
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 10,
                }}
              />

              {/* FOTO */}
              <Boton
                text="Añadir foto 📸"
                color={colors.secondary}
                onPress={() => subirFoto(i)}
              />

              {/* ScrollView horizontal para fotos */}
              <ScrollView horizontal style={{ marginTop: 10 }}>
                {(p.fotos || []).map((fotoUrl, idx) => (
                  <View key={idx} style={{ marginRight: 8 }}>
                    <Image
                      source={{ uri: fotoUrl }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 16,
                      }}
                    />
                  </View>
                ))}
              </ScrollView>
            </MotiView>
          );
        })}

        <Boton
          text="⬅ Volver"
          color={colors.warning}
          onPress={() => setView("inicio")}
        />
      </ScrollView>
    </Container>
  );
}
