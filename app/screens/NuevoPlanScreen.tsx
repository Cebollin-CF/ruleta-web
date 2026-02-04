import { MotiView } from "moti";
import React from "react";
import {
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
import { Plan, Usuario, DatedPlan, Nota } from "../utils/types";

interface NuevoPlanScreenProps {
  setView: (view: string) => void;
  planes: Plan[];
  setPlanes: (planes: Plan[]) => void;
  titulo: string;
  setTitulo: (titulo: string) => void;
  precio: string;
  setPrecio: (precio: string) => void;
  duracion: string;
  setDuracion: (duracion: string) => void;
  categoria: string;
  setCategoria: (categoria: string) => void;
  editando: boolean;
  setEditando: (editando: boolean) => void;
  planEditandoId: string | null;
  setPlanEditandoId: (id: string | null) => void;
  guardarNuevoPlan: (plan: Plan) => Promise<boolean>;
  coupleId: string | null;
  planesPorDia: Record<string, DatedPlan[]>;
  notas: Nota[];
  setPlanActual: (plan: Plan | null) => void;
  setIntentosRuleta: (intentos: number) => void;
  planTieneFecha: (planId: string) => boolean;
  usuarioActual: Usuario | null;
  guardarPlanesPorDia: (fecha: string, lista: DatedPlan[]) => Promise<boolean>;
  marcarComoCompletado: (planId: string) => Promise<boolean>;
  mostrarToast: (mensaje: string, tipo?: 'success' | 'error' | 'warning' | 'info', emoji?: string) => void;
  eliminarPlan: (planId: string) => Promise<boolean>;
  editarPlan: (planId: string, datos: any) => Promise<boolean>;
  guardarEnSupabase: (planes?: any, planesPorDia?: any) => Promise<boolean>;
}

export default function NuevoPlanScreen({
  setView,
  planes,
  setPlanes,
  titulo,
  setTitulo,
  precio,
  setPrecio,
  duracion,
  setDuracion,
  categoria,
  setCategoria,
  editando,
  setEditando,
  planEditandoId,
  setPlanEditandoId,
  guardarNuevoPlan,
  coupleId,
  planesPorDia,
  notas,
  setPlanActual,
  setIntentosRuleta,
  planTieneFecha,
  usuarioActual,
  guardarPlanesPorDia,
  marcarComoCompletado: marcarComoCompletadoProp,
  mostrarToast,
  eliminarPlan: eliminarPlanProp,
  editarPlan,
  guardarEnSupabase,
}: NuevoPlanScreenProps) {
  const [loadingAction, setLoadingAction] = React.useState(false);

  const guardarPlan = async () => {
    if (!titulo.trim()) {
      mostrarToast("El título no puede estar vacío", "error", "❌");
      return;
    }
    setLoadingAction(true);

    try {
      if (editando) {
        if (!planEditandoId) {
          mostrarToast("Error: ID del plan a editar no encontrado.", "error", "❌");
          setLoadingAction(false);
          return;
        }
        const success = await editarPlan(planEditandoId, {
          titulo: titulo.trim(),
          precio: precio.trim() || null,
          duracion: duracion.trim() || null,
          categoria: categoria || null,
        });

        if (success) {
          setEditando(false);
          setPlanEditandoId(null);
          setTitulo("");
          setPrecio("");
          setDuracion("");
          setCategoria("");
          mostrarToast("Plan editado con éxito", "success", "✏️");
        } else {
          mostrarToast("Error al editar el plan", "error", "❌");
        }
        return;
      }

      const nuevoPlan = {
        id: Date.now().toString(),
        titulo: titulo.trim(),
        precio: precio.trim() || null,
        duracion: duracion.trim() || null,
        categoria: categoria || null,
        completado: false,
        seguirEnRuleta: true,
        creadoPor: usuarioActual?.nombre || 'Desconocido',
      };

      const success = await guardarNuevoPlan(nuevoPlan);

      if (success) {
        setTitulo("");
        setPrecio("");
        setDuracion("");
        setCategoria("");
        mostrarToast("Plan guardado con éxito", "success", "❤️");
      } else {
        mostrarToast("Error al guardar el plan", "error", "❌");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const marcarComoCompletado = async (planId: string) => {
    setLoadingAction(true);
    try {
      const success = await marcarComoCompletadoProp(planId);
      if (success) {
        mostrarToast("Plan marcado como completado", "success", "🎉");
      } else {
        mostrarToast("Error al marcar plan como completado", "error", "❌");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const eliminarPlan = async (planId: string) => {
    setLoadingAction(true);
    try {
      const success = await eliminarPlanProp(planId);
      if (success) {
        mostrarToast("Plan eliminado con éxito", "success", "🗑️");
      } else {
        mostrarToast("Error al eliminar el plan", "error", "❌");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const moverAPendiente = async (planId) => {
    console.log("moverAPendiente llamado para plan:", planId);
    setLoadingAction(true);

    try {
      const nuevosPlanesPorDia = JSON.parse(JSON.stringify(planesPorDia || {}));
      let fechaAfectada = null;

      Object.keys(nuevosPlanesPorDia).forEach((fecha) => {
        const listaOriginal = nuevosPlanesPorDia[fecha];
        const nuevaLista = listaOriginal.filter((p) => p.planId !== planId);

        if (nuevaLista.length < listaOriginal.length) {
          fechaAfectada = fecha;
          nuevosPlanesPorDia[fecha] = nuevaLista;
        }

        if (nuevosPlanesPorDia[fecha].length === 0) {
          delete nuevosPlanesPorDia[fecha];
        }
      });

      if (fechaAfectada && typeof guardarPlanesPorDia === 'function') {
        const success = await guardarPlanesPorDia(fechaAfectada, nuevosPlanesPorDia[fechaAfectada] || []);
        if (success) {
          mostrarToast("Plan movido a pendientes", "info", "↩️");
        } else {
          mostrarToast("Error al mover plan a pendientes", "error", "❌");
        }
      }
    } finally {
      setLoadingAction(false);
    }
  };


  // ✅ CLASIFICAR PLANES
  const planesPendientes = planes.filter((p) => !p.completado && !planTieneFecha(p.id));
  const planesConFecha = planes.filter((p) => !p.completado && planTieneFecha(p.id));
  const planesCompletados = planes.filter((p) => p.completado);

  return (
    <Container>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={{ color: colors.accent, fontSize: 32, fontWeight: "800", marginBottom: 10 }}>
          {editando ? "✏️ Editar plan" : "➕ Nuevo plan"}
        </Text>

        {/* FORMULARIO */}
        <TextInput
          placeholder="Nombre del plan"
          placeholderTextColor={colors.muted}
          value={titulo}
          onChangeText={setTitulo}
          style={{
            backgroundColor: colors.card,
            color: "#FFFFFF",
            padding: 14,
            borderRadius: 20,
            marginBottom: 10,
            borderWidth: 2,
            borderColor: "#FFFFFF20",
          }}
        />

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <TextInput
            placeholder="Precio (€)"
            placeholderTextColor={colors.muted}
            value={precio}
            onChangeText={setPrecio}
            keyboardType="numeric"
            style={{
              backgroundColor: colors.card,
              color: "#FFFFFF",
              padding: 14,
              borderRadius: 20,
              flex: 1,
              borderWidth: 2,
              borderColor: "#FFFFFF20",
            }}
          />

          <TextInput
            placeholder="Minutos"
            placeholderTextColor={colors.muted}
            value={duracion}
            onChangeText={setDuracion}
            keyboardType="numeric"
            style={{
              backgroundColor: colors.card,
              color: "#FFFFFF",
              padding: 14,
              borderRadius: 20,
              flex: 1,
              borderWidth: 2,
              borderColor: "#FFFFFF20",
            }}
          />
        </View>

        <Boton
          text={editando ? "Guardar cambios ✏️" : "Guardar plan ❤️"}
          color={colors.primary}
          onPress={guardarPlan}
          disabled={loadingAction}
        />

        {/* ====== TRES COLUMNAS ====== */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 20,
          }}
        >
          {/* 🟢 PENDIENTES */}
          <View style={{ flex: 1 }}>
            <Text style={{
              color: "#6BD18A",
              fontSize: 13,
              fontWeight: "700",
              marginBottom: 8,
              textAlign: "center"
            }}>
              🟢 Pendientes
            </Text>

            <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
              {planesPendientes.map((plan) => (
                <View
                  key={plan.id}
                  style={{
                    backgroundColor: colors.card,
                    padding: 10,
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: 2,
                    borderColor: "#FFFFFF20",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      marginBottom: 8,
                      fontSize: 12,
                      fontWeight: '600'
                    }}
                    numberOfLines={2}
                  >
                    {plan.titulo}
                  </Text>

                  {/* ✅ MOSTRAR CREADOR SI EXISTE */}
                  {plan.creadoPor && (
                    <Text style={{ color: colors.muted, fontSize: 10, marginBottom: 8 }}>
                      Creado por: {plan.creadoPor}
                    </Text>
                  )}

                  {/* ✅ BOTONES PEQUEÑOS Y ESTÉTICOS */}
                  <View style={{ gap: 4 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setPlanActual(plan);
                        setIntentosRuleta(0);
                        setView("calendario");
                      }}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: colors.primary,
                        paddingVertical: 5,
                        paddingHorizontal: 6,
                        borderRadius: 6,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 10 }}>
                        🎯 Usar
                      </Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', gap: 3 }}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditando(true);
                          setPlanEditandoId(plan.id);
                          setTitulo(plan.titulo);
                          setPrecio(plan.precio || "");
                          setDuracion(plan.duracion || "");
                          setCategoria(plan.categoria || "");
                        }}
                        activeOpacity={0.7}
                        style={{
                          flex: 1,
                          backgroundColor: colors.secondary,
                          paddingVertical: 4,
                          borderRadius: 6,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 10 }}>✏️</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => eliminarPlan(plan.id)}
                        disabled={loadingAction}
                        activeOpacity={0.7}
                        style={{
                          flex: 1,
                          backgroundColor: colors.danger,
                          paddingVertical: 4,
                          borderRadius: 6,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 10 }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 📅 CON FECHA */}
          <View style={{ flex: 1 }}>
            <Text style={{
              color: "#FFD93D",
              fontSize: 13,
              fontWeight: "700",
              marginBottom: 8,
              textAlign: "center"
            }}>
              📅 Con fecha
            </Text>

            <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
              {planesConFecha.map((plan) => (
                <View
                  key={plan.id}
                  style={{
                    backgroundColor: colors.card,
                    padding: 10,
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: 2,
                    borderColor: "#FFD93D40",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      marginBottom: 8,
                      fontSize: 12,
                      fontWeight: '600'
                    }}
                    numberOfLines={2}
                  >
                    {plan.titulo}
                  </Text>

                  {/* ✅ MOSTRAR CREADOR SI EXISTE */}
                  {plan.creadoPor && (
                    <Text style={{ color: colors.muted, fontSize: 10, marginBottom: 8 }}>
                      Creado por: {plan.creadoPor}
                    </Text>
                  )}

                  {/* ✅ BOTONES PARA PLANES CON FECHA */}
                  <View style={{ gap: 4 }}>
                    <TouchableOpacity
                      onPress={() => marcarComoCompletado(plan.id)}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: colors.success,
                        paddingVertical: 5,
                        paddingHorizontal: 6,
                        borderRadius: 6,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 10 }}>
                        ✓ Hecho
                      </Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', gap: 3 }}>
                      <TouchableOpacity
                        onPress={() => moverAPendiente(plan.id)}
                        activeOpacity={0.7}
                        style={{
                          flex: 1,
                          backgroundColor: colors.warning,
                          paddingVertical: 4,
                          borderRadius: 6,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 10 }}>✕</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setEditando(true);
                          setPlanEditandoId(plan.id);
                          setTitulo(plan.titulo);
                          setPrecio(plan.precio || "");
                          setDuracion(plan.duracion || "");
                          setCategoria(plan.categoria || "");
                        }}
                        activeOpacity={0.7}
                        style={{
                          flex: 1,
                          backgroundColor: colors.secondary,
                          paddingVertical: 4,
                          borderRadius: 6,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 10 }}>✏️</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => eliminarPlan(plan.id)}
                        disabled={loadingAction}
                        activeOpacity={0.7}
                        style={{
                          flex: 1,
                          backgroundColor: colors.danger,
                          paddingVertical: 4,
                          borderRadius: 6,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 10 }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* ✅ COMPLETADOS */}
          <View style={{ flex: 1 }}>
            <Text style={{
              color: colors.muted,
              fontSize: 13,
              fontWeight: "700",
              marginBottom: 8,
              textAlign: "center"
            }}>
              ✓ Hechos
            </Text>

            <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
              {planesCompletados.map((plan) => (
                <View
                  key={plan.id}
                  style={{
                    backgroundColor: colors.card,
                    padding: 10,
                    borderRadius: 12,
                    marginBottom: 8,
                    opacity: 0.7,
                    borderWidth: 2,
                    borderColor: "#FFFFFF10",
                  }}
                >
                  <Text
                    style={{
                      color: colors.muted,
                      textDecorationLine: "line-through",
                      marginBottom: 8,
                      fontSize: 11,
                      fontWeight: '600'
                    }}
                    numberOfLines={2}
                  >
                    {plan.titulo}
                  </Text>

                  {/* ✅ MOSTRAR CREADOR SI EXISTE */}
                  {plan.creadoPor && (
                    <Text style={{ color: colors.muted, fontSize: 10, marginBottom: 8 }}>
                      Creado por: {plan.creadoPor}
                    </Text>
                  )}

                  <View style={{ gap: 4 }}>
                    <TouchableOpacity
                      onPress={async () => {
                        const nuevoPlan = {
                          ...plan,
                          id: Date.now().toString() + Math.random().toString(36).slice(2),
                          completado: false,
                          seguirEnRuleta: true,
                        };

                        if (typeof guardarNuevoPlan === 'function') {
                          await guardarNuevoPlan(nuevoPlan);
                        }
                      }}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: colors.success,
                        paddingVertical: 5,
                        borderRadius: 6,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 9 }}>
                        🔄 Reusar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => eliminarPlan(plan.id)}
                      disabled={loadingAction}
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: '#FFFFFF15',
                        paddingVertical: 4,
                        borderRadius: 6,
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: colors.muted, fontSize: 9 }}>Borrar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
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