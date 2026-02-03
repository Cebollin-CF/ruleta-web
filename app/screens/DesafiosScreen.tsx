import React from "react";
import { Text, ScrollView, TouchableOpacity, View } from "react-native";
import { MotiView } from "moti";
import Container from "../components/Container";
import colors from "../utils/colors";

export default function DesafiosScreen({
  setView,
  desafioActual,
  progreso,
  completarDesafio,
  generarNuevoDesafio,
  desafiosDisponibles,
  ultimaActualizacion,
  intentosCambio,
  mostrarToast,
}) {
  const porcentaje = desafioActual ? Math.min((progreso / desafioActual.meta) * 100, 100) : 0;
  const hoy = new Date().toISOString().split('T')[0];
  const completadoHoy = desafioActual?.meta > 1 && ultimaActualizacion === hoy;
  const estaBloqueado = progreso > 0 && progreso < (desafioActual?.meta || 0);

  const handleCompletar = async () => {
    if (completadoHoy) {
      if (mostrarToast) mostrarToast("⏳ Ya has avanzado hoy. ¡Vuelve mañana!", "info");
      return;
    }

    const resultado = await completarDesafio();
    if (resultado?.success) {
      if (resultado.completado) {
        if (mostrarToast) mostrarToast("🎉 ¡Desafío completado!", "success");
      } else {
        if (mostrarToast) mostrarToast("✅ ¡Progreso registrado!", "success");
      }
    } else if (resultado?.error) {
      if (mostrarToast) mostrarToast(`❌ ${resultado.error}`, "error");
    }
  };

  return (
    <Container>
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        <Text
          style={{
            color: colors.accent,
            fontSize: 32,
            fontWeight: "800",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          🎯 Desafíos de pareja
        </Text>
      </MotiView>

      {/* Desafío actual */}
      {desafioActual ? (
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          style={{
            backgroundColor: colors.primary,
            padding: 24,
            borderRadius: 20,
            marginBottom: 20,
            borderWidth: 3,
            borderColor: "#FFB3D1",
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <MotiView
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              type: "timing",
              duration: 2000,
              loop: true,
              repeatReverse: true,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 60, textAlign: "center", marginBottom: 10 }}>
              {desafioActual.emoji}
            </Text>
          </MotiView>

          <Text style={{ color: "#fff", fontSize: 20, textAlign: "center", fontWeight: "800", marginBottom: 16 }}>
            {desafioActual.texto}
          </Text>

          {/* Barra de progreso */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.3)",
              height: 16,
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.5)"
            }}
          >
            <MotiView
              from={{ width: "0%" }}
              animate={{ width: `${porcentaje}%` }}
              transition={{ type: "timing", duration: 800 }}
              style={{
                backgroundColor: "#fff",
                height: "100%",
                borderRadius: 8,
              }}
            />
          </View>

          <Text style={{ color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "700" }}>
            {progreso} / {desafioActual.meta} completado
          </Text>

          {/* Botones */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
            <TouchableOpacity
              onPress={handleCompletar}
              activeOpacity={completadoHoy ? 1 : 0.7}
              style={{
                flex: 1,
                backgroundColor: completadoHoy ? colors.muted : colors.success,
                paddingVertical: 14,
                borderRadius: 16,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.3)"
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                {completadoHoy ? "⏳ Vuelve mañana" : "✓ Marcar +1"}
              </Text>
            </TouchableOpacity>

            {!estaBloqueado && (
              <TouchableOpacity
                onPress={async () => {
                  const res = await generarNuevoDesafio();
                  if (res?.error && mostrarToast) {
                    mostrarToast(`⚠️ ${res.error}`, "warning");
                  }
                }}
                activeOpacity={intentosCambio >= 5 ? 1 : 0.7}
                style={{
                  flex: 1,
                  backgroundColor: intentosCambio >= 5 ? colors.muted : "rgba(255,255,255,0.2)",
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.3)"
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                  {intentosCambio >= 5 ? "Máx. cambios" : `🔄 Cambiar (${intentosCambio}/5)`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {estaBloqueado && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 10, alignItems: 'center' }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontStyle: 'italic' }}>
                🔒 Desafío en curso. Termínalo para cambiar.
              </Text>
            </MotiView>
          )}
        </MotiView>
      ) : (
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring" }}
        >
          <TouchableOpacity
            onPress={generarNuevoDesafio}
            style={{
              backgroundColor: colors.primary,
              padding: 30,
              borderRadius: 20,
              alignItems: "center",
              marginBottom: 20,
              borderWidth: 3,
              borderColor: "#FFB3D1",
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <MotiView
              animate={{ rotate: ['0deg', '10deg', '-10deg', '0deg'] }}
              transition={{ loop: true, duration: 2000, repeatReverse: false }}
            >
              <Text style={{ fontSize: 60, marginBottom: 10 }}>🎲</Text>
            </MotiView>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>
              Generar un Desafío
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, marginTop: 5 }}>
              ¡Atrévete a probar suerte!
            </Text>
          </TouchableOpacity>
        </MotiView>
      )}

      {/* Lista de desafíos disponibles */}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 12, marginTop: 10 }}>
          📚 Catálogo de Ideas
        </Text>

        {["corto", "medio", "largo", "unico"].map((tipo) => {
          const titulo = tipo === "corto" ? "⚡ Rápidos (1-3 días)" :
            tipo === "medio" ? "📅 Semanales (5-7 días)" :
              tipo === "largo" ? "🏆 Épicos (10+ días)" : "⭐ Especiales (1 vez)";
          const colorBorde = tipo === "corto" ? "#FFD93D" :
            tipo === "medio" ? "#6BCF7F" :
              tipo === "largo" ? "#FF6B9D" : "#A66CFF";

          const items = desafiosDisponibles?.filter(d => d.duracion === tipo);
          if (!items?.length) return null;

          return (
            <View key={tipo}>
              <Text style={{ color: colors.accent, fontSize: 16, fontWeight: "800", marginBottom: 8, marginTop: 12 }}>
                {titulo}
              </Text>
              {items.map((desafio, idx) => (
                <MotiView
                  key={`${tipo}-${idx}`}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: idx * 50 + 200 }}
                  style={{
                    backgroundColor: colors.card,
                    padding: 16,
                    borderRadius: 16,
                    marginBottom: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: colorBorde, // Borde según tipo
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text style={{ fontSize: 32, marginRight: 15 }}>{desafio.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: 15, fontWeight: "500" }}>{desafio.texto}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <View style={{ backgroundColor: colorBorde, width: 8, height: 8, borderRadius: 4, marginRight: 6 }} />
                      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>Meta: {desafio.meta} {desafio.meta === 1 ? 'vez' : 'veces'}</Text>
                    </View>
                  </View>
                </MotiView>
              ))}
            </View>
          );
        })}
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