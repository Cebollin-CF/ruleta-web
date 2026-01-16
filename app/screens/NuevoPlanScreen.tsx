import React from "react";
import {
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import Container from "../components/Container";
import Boton from "../components/Boton";
import colors from "../utils/colors";
import { MotiView } from "moti";
import PlanItem from "../components/PlanItem";
import { supabase } from "../../supabaseClient";

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

  const guardarPlan = () => {
    if (!titulo.trim()) return;

    // 🔧 MODO EDICIÓN
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

      const contenidoActual = { planes: nuevos, planesPorDia, notas };

      supabase
        .from("app_state")
        .update({ contenido: contenidoActual })
        .eq("id", coupleId);

      setEditando(false);
      setPlanEditandoId(null);
      setTitulo("");
      setPrecio("");
      setDuracion("");
      setCategoria("");

      return;
    }

    // ➕ CREAR NUEVO PLAN
    const nuevoId = Date.now().toString();

    const nuevoPlan = {
      id: nuevoId,
      titulo: titulo.trim(),
      precio: precio.trim() || null,
      duracion: duracion.trim() || null,
      categoria: categoria || null,
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
      <ScrollView>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
        >
          <Text
            style={{
              color: colors.accent,
              fontSize: 32,
              fontWeight: "800",
              marginBottom: 16,
            }}
          >
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
            marginBottom: 20,
            fontSize: 16,
          }}
        />

        <TextInput
          placeholder="Precio (€) — opcional"
          placeholderTextColor={colors.muted}
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            padding: 14,
            borderRadius: 20,
            marginBottom: 20,
            fontSize: 16,
          }}
        />

        <TextInput
          placeholder="Duración (min) — opcional"
          placeholderTextColor={colors.muted}
          value={duracion}
          onChangeText={setDuracion}
          keyboardType="numeric"
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            padding: 14,
            borderRadius: 20,
            marginBottom: 20,
            fontSize: 16,
          }}
        />

        <Text
          style={{
            color: colors.text,
            marginBottom: 8,
            fontWeight: "600",
          }}
        >
          Categoría (opcional)
        </Text>

        <ScrollView horizontal style={{ marginBottom: 20 }}>
          {categoriasDisponibles.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategoria(cat)}
              style={{
                backgroundColor:
                  categoria === cat ? colors.primary : colors.card,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 20,
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  color: categoria === cat ? "#fff" : colors.text,
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Boton
          text={editando ? "Guardar cambios ✏️" : "Guardar plan ❤️"}
          color={colors.primary}
          onPress={guardarPlan}
        />

        {/* LISTA DE PLANES */}
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: "600",
            marginVertical: 20,
          }}
        >
          📋 Planes existentes
        </Text>

        {planes.length === 0 && (
          <Text style={{ color: colors.muted }}>
            Aún no hay planes creados
          </Text>
        )}

        {planes.map((plan) => (
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

              const contenidoActual = {
                planes: nuevos,
                planesPorDia,
                notas,
              };

              supabase
                .from("app_state")
                .update({ contenido: contenidoActual })
                .eq("id", coupleId);
            }}
          />
        ))}

        <Boton
          text="⬅ Volver"
          color={colors.warning}
          onPress={() => setView("inicio")}
        />
      </ScrollView>
    </Container>
  );
}
