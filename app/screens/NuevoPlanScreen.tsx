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
import PlanItem from "../components/PlanItem";
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
}) {
  const categoriasDisponibles = [
    "Romántico",
    "Barato",
    "Aventura",
    "Comida",
    "Cine",
    "Juegos",
    "Naturaleza",
  ];

  const planesNormales = planes.filter((p) => !p.completado);
  const planesCompletados = planes.filter((p) => p.completado);

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

  return (
    <Container>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
        >
          <Text style={{ color: colors.accent, fontSize: 32, fontWeight: "800", marginBottom: 10 }}>
            {editando ? "✏️ Editar plan" : "➕ Nuevo plan"}
          </Text>
        </MotiView>

        {/* FORMULARIO */}
        <TextInput
          placeholder="Nombre del plan"
          placeholderTextColor={colors.muted}
          value={titulo}
          onChangeText={setTitulo}
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            padding: 14,
            borderRadius: 20,
            marginBottom: 10,
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
                color: colors.text,
                padding: 14,
                borderRadius: 20,
                flex: 1
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
                color: colors.text,
                padding: 14,
                borderRadius: 20,
                flex: 1
            }}
            />
        </View>

        <Boton
          text={editando ? "Guardar cambios ✏️" : "Guardar plan ❤️"}
          color={colors.primary}
          onPress={guardarPlan}
        />

        {/* ====== DOS COLUMNAS ====== */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginTop: 30,
          }}
        >
          {/* 🟢 SIN COMPLETAR */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
              🟢 Pendientes
            </Text>

            {planesNormales.map((plan) => (
              <PlanItem
                key={plan.id}
                plan={plan}
                onUse={() => {
                  setPlanActual(plan);
                  setIntentosRuleta(0);
                  setView("calendario");
                }}
                onEdit={() => {
                  setEditando(true);
                  setPlanEditandoId(plan.id);
                  setTitulo(plan.titulo);
                  setPrecio(plan.precio || "");
                  setDuracion(plan.duracion || "");
                  setCategoria(plan.categoria || "");
                }}
                onDelete={() => {
                  const nuevos = planes.filter((p) => p.id !== plan.id);
                  setPlanes(nuevos);

                  supabase
                    .from("app_state")
                    .update({
                      contenido: { planes: nuevos, planesPorDia, notas },
                    })
                    .eq("id", coupleId);
                }}
              />
            ))}
          </View>

          {/* ✓ COMPLETADOS */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.muted, fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
              ✓ Hechos
            </Text>

            {planesCompletados.map((plan) => (
              <View
                key={plan.id}
                style={{
                  backgroundColor: colors.card,
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 14,
                  opacity: 0.8
                }}
              >
                <Text
                  style={{
                    color: colors.muted,
                    textDecorationLine: "line-through",
                    marginBottom: 10,
                    fontSize: 14,
                    fontWeight: '600'
                  }}
                >
                  {plan.titulo}
                </Text>

                <View style={{ gap: 5 }}>
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
                        .update({
                            contenido: { planes: nuevos, planesPorDia, notas },
                        })
                        .eq("id", coupleId);
                    }}
                    style={{
                        backgroundColor: colors.success,
                        paddingVertical: 8,
                        borderRadius: 10,
                        alignItems: 'center'
                    }}
                    >
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 11 }}>
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
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            paddingVertical: 6,
                            borderRadius: 10,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{ color: colors.muted, fontSize: 10 }}>Borrar</Text>
                    </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
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