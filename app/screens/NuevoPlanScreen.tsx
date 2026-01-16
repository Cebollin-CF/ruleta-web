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

      // Guardar en Supabase
      const contenidoActual = { planes, planesPorDia, notas };

      supabase
        .from("app_state")
        .update({
          contenido: {
            ...contenidoActual,
            planes: nuevos,
          },
        })
        .eq("id", coupleId);

      // Reset
      setEditando(false);
      setPlanEditandoId(null);
      setTitulo("");
      setPrecio("");
      setDuracion("");
      setCategoria("");

      return;
    }

    // ➕ MODO CREAR NUEVO PLAN
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

    // Reset
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

        {/* 📝 FORMULARIO */}
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

        {/* 📋 LISTA DE PLANES EXISTENTES */}
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
          <MotiView
            key={plan.id}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 }}
            style={{
              backgroundColor: colors.card,
              padding: 16,
              borderRadius: 20,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 6,
              }}
            >
              {plan.titulo}
            </Text>

            {plan.precio && (
              <Text style={{ color: colors.muted, fontSize: 14 }}>
                💰 {plan.precio} €
              </Text>
            )}

            {plan.duracion && (
              <Text style={{ color: colors.muted, fontSize: 14 }}>
                ⏳ {plan.duracion} min
              </Text>
            )}

            {plan.categoria && (
              <Text style={{ color: colors.muted, fontSize: 14 }}>
                🏷 {plan.categoria}
              </Text>
            )}

            {/* 👉 USAR PLAN */}
            <TouchableOpacity
              onPress={() => {
                setPlanActual(plan);
                setIntentosRuleta(0);
                setView("calendario");
              }}
            >
              <Text
                style={{
                  color: colors.secondary,
                  marginTop: 10,
                  fontWeight: "600",
                }}
              >
                Usar →
              </Text>
            </TouchableOpacity>

            {/* ✏️ EDITAR PLAN */}
            <TouchableOpacity
              onPress={() => {
                setEditando(true);
                setPlanEditandoId(plan.id);
                setTitulo(plan.titulo);
                setPrecio(plan.precio || "");
                setDuracion(plan.duracion || "");
                setCategoria(plan.categoria || "");
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  marginTop: 6,
                  fontWeight: "600",
                }}
              >
                Editar ✏️
              </Text>
            </TouchableOpacity>
          </MotiView>
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
