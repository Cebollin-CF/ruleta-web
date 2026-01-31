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
  planTieneFecha, // ✅ Recibido del hook
}) {
  const guardarPlan = () => {
    if (!titulo.trim()) return;

    if (editando) {
      const nuevos = planes.map((p) =>
        p.id === planEditandoId
          ? {
              ...p,
              titulo: titulo.trim(),
              precio: precio.trim() || null,
              duracion: duracion.trim() || null,
              categoria: categoria || null,
            }
          : p
      );

      setPlanes(nuevos);

      supabase
        .from("app_state")
        .update({ contenido: { planes: nuevos, planesPorDia, notas } })
        .eq("id", coupleId);

      setEditando(false);
      setPlanEditandoId(null);
      setTitulo("");
      setPrecio("");
      setDuracion("");
      setCategoria("");
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
    };

    setPlanes([...planes, nuevoPlan]);
    guardarNuevoPlan(nuevoPlan, coupleId);

    setTitulo("");
    setPrecio("");
    setDuracion("");
    setCategoria("");
  };

  // ✅ FUNCIÓN PARA MOVER PLAN DE "CON FECHA" A "PENDIENTE"
  const moverAPendiente = (planId) => {
    // Eliminar el plan de todas las fechas
    const nuevosPlanesPorDia = { ...planesPorDia };
    Object.keys(nuevosPlanesPorDia).forEach((fecha) => {
      nuevosPlanesPorDia[fecha] = nuevosPlanesPorDia[fecha].filter(
        (p) => p.planId !== planId
      );
      if (nuevosPlanesPorDia[fecha].length === 0) {
        delete nuevosPlanesPorDia[fecha];
      }
    });

    // Actualizar en Supabase
    supabase
      .from("app_state")
      .update({
        contenido: { planes, planesPorDia: nuevosPlanesPorDia, notas },
      })
      .eq("id", coupleId);
  };

  // ✅ FUNCIÓN PARA MARCAR COMO COMPLETADO DESDE "CON FECHA"
  const marcarComoCompletado = (planId) => {
    const nuevosPlanes = planes.map((p) =>
      p.id === planId ? { ...p, completado: true } : p
    );

    setPlanes(nuevosPlanes);

    supabase
      .from("app_state")
      .update({
        contenido: { planes: nuevosPlanes, planesPorDia, notas },
      })
      .eq("id", coupleId);
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
                        onPress={() => {
                          const nuevos = planes.filter((p) => p.id !== plan.id);
                          setPlanes(nuevos);
                          supabase
                            .from("app_state")
                            .update({ contenido: { planes: nuevos, planesPorDia, notas } })
                            .eq("id", coupleId);
                        }}
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
                        onPress={() => {
                          const nuevos = planes.filter((p) => p.id !== plan.id);
                          setPlanes(nuevos);
                          supabase
                            .from("app_state")
                            .update({ contenido: { planes: nuevos, planesPorDia, notas } })
                            .eq("id", coupleId);
                        }}
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

                  <View style={{ gap: 4 }}>
                    <TouchableOpacity
                      onPress={() => {
                        const nuevoPlan = {
                          ...plan,
                          id: Date.now().toString() + Math.random().toString(36).slice(2),
                          completado: false,
                          seguirEnRuleta: true,
                        };

                        const nuevos = [
                          ...planes.filter((p) => p.id !== plan.id),
                          nuevoPlan,
                        ];

                        setPlanes(nuevos);

                        supabase
                          .from("app_state")
                          .update({ contenido: { planes: nuevos, planesPorDia, notas } })
                          .eq("id", coupleId);
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
                      onPress={() => {
                        const nuevos = planes.filter((p) => p.id !== plan.id);
                        setPlanes(nuevos);
                        supabase
                          .from("app_state")
                          .update({ contenido: { planes: nuevos, planesPorDia, notas } })
                          .eq("id", coupleId);
                      }}
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