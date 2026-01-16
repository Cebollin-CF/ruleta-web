import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarCodeScanner } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import QRCode from "react-native-qrcode-svg";
import { supabase } from "../../supabaseClient";

const colors = {
  bg: "#fdbceb", // fondo rosa pastel sencillo
  card: "#ffffff",
  primary: "#ff6b9c",
  secondary: "#b28dff",
  text: "#4a4a4a",
  muted: "#a8a8a8",
  success: "#6bd18a",
  warning: "#f7c56d",
};

function Boton({ text, onPress, color, small }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: color,
        paddingVertical: small ? 10 : 18,
        paddingHorizontal: small ? 14 : 24,
        borderRadius: 20,
        marginBottom: 14,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <Text style={{ color: "#fff", fontSize: small ? 14 : 20, fontWeight: "700" }}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

// Sube una foto a Supabase Storage y devuelve la URL pública
async function uploadPhotoToSupabase(uri: string, coupleId: string) {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileName = `${coupleId}/${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("fotos")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.log("Error subiendo foto:", error);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("fotos")
      .getPublicUrl(fileName);

    return publicData?.publicUrl ?? null;
  } catch (e) {
    console.log("Error inesperado subiendo foto:", e);
    return null;
  }
}

async function guardarNuevoPlan(plan, coupleId) {
  const { data, error } = await supabase
    .from("app_state")
    .select("contenido")
    .eq("id", coupleId)
    .single();

  if (error || !data) return;

  const contenidoActual = data.contenido || { planes: [], planesPorDia: {} };

  const nuevosPlanes = [...contenidoActual.planes, plan];

  const nuevoContenido = {
    ...contenidoActual,
    planes: nuevosPlanes,
  };

  await supabase
    .from("app_state")
    .update({ contenido: nuevoContenido })
    .eq("id", coupleId);
}

async function guardarPlanesPorDia(fecha, datos, coupleId) {
  const { data, error } = await supabase
    .from("app_state")
    .select("contenido")
    .eq("id", coupleId)
    .single();

  if (error || !data) return;

  const contenidoActual = data.contenido || { planes: [], planesPorDia: {} };

  const nuevoContenido = {
    ...contenidoActual,
    planesPorDia: {
      ...contenidoActual.planesPorDia,
      [fecha]: datos,
    },
  };

  await supabase
    .from("app_state")
    .update({ contenido: nuevoContenido })
    .eq("id", coupleId);
}


export default function Index() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"vinculo" | "inicio" | "ruleta" | "nuevo" | "calendario" | "review" | "galeria">("vinculo");

  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [planes, setPlanes] = useState<any[]>([]);
  const [planesPorDia, setPlanesPorDia] = useState<any>({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [intentosRuleta, setIntentosRuleta] = useState(0);
  const [planActual, setPlanActual] = useState<any | null>(null);
  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [codigoManual, setCodigoManual] = useState("");
  const [editando, setEditando] = useState(false);
  const [planEditandoId, setPlanEditandoId] = useState(null);

  // QR / Scanner
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannerActive, setScannerActive] = useState(false);

  // ─── CARGA INICIAL: leer coupleId de AsyncStorage ───
  useEffect(() => {
    const init = async () => {
      try {
        const savedCoupleId = await AsyncStorage.getItem("couple_id");
        if (savedCoupleId) {
          setCoupleId(savedCoupleId);
          setView("inicio");
        } else {
          setView("vinculo");
        }
      } catch {
        setView("vinculo");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ─── CARGA DE ESTADO DE SUPABASE CUANDO HAY COUPLE_ID ───
  useEffect(() => {
    if (!coupleId) return;

    const cargar = async () => {
      try {
        const { data } = await supabase
          .from("app_state")
          .select("contenido")
          .eq("id", coupleId)
          .single();

        if (data?.contenido) {
          setPlanes(data.contenido.planes || []);
          setPlanesPorDia(data.contenido.planesPorDia || {});
        } else {
          // si no existe fila, creamos una vacía
          await supabase.from("app_state").upsert({
            id: coupleId,
            contenido: { planes: [], planesPorDia: {} },
          });
        }
      } catch {
        console.log("Modo local / error cargando app_state");
      }
    };

    cargar();
  }, [coupleId]);


  // ─── SUSCRIPCIÓN A CAMBIOS EN SUPABASE (sincronización) ───
  useEffect(() => {
    if (!coupleId) return;

    const channel = supabase
      .channel(`app_state_${coupleId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_state",
          filter: `id=eq.${coupleId}`,
        },
        (payload) => {
          const contenido = (payload.new as any)?.contenido;
          if (contenido) {
            setPlanes(contenido.planes || []);
            setPlanesPorDia(contenido.planesPorDia || {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // ─── PANTALLA DE CARGA ───
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const Container = ({ children }: { children: React.ReactNode }) => (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>{children}</View>
  );

  // ──────────────────────
  // 🔗 VÍNCULO DE PAREJA (QR + ESCÁNER)
  // ──────────────────────
  if (view === "vinculo") {
    const crearPareja = async () => {
      const id = Math.random().toString(36).substring(2, 10); // sencillo pero suficiente
      setCoupleId(id);
      await AsyncStorage.setItem("couple_id", id);
      setView("inicio");
    };

    const pedirPermisoCamara = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasCameraPermission(status === "granted");
      if (status === "granted") setScannerActive(true);
    };

    const manejarScan = async ({ data }: { data: string }) => {
      setScannerActive(false);
      if (!data) return;
      setCoupleId(data);
      await AsyncStorage.setItem("couple_id", data);
      setView("inicio");
    };

    return (
      <Container>
        <Text
          style={{
            color: colors.primary,
            fontSize: 28,
            fontWeight: "800",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          💕 Conectar pareja
        </Text>

        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Uno crea el código, el otro lo escanea. Así compartís todos los planes, fotos y recuerdos.
        </Text>

        {!coupleId && !scannerActive && (
  <>
    <Boton
      text="✨ Crear vínculo nuevo"
      color={colors.primary}
      onPress={crearPareja}
    />
    <Boton
      text="📷 Escanear código de mi pareja"
      color={colors.secondary}
      onPress={pedirPermisoCamara}
    />

    {/* 🔽 AQUI PEGAS EL INPUT MANUAL 🔽 */}
    <TextInput
      placeholder="Introduce el código de tu pareja"
      placeholderTextColor={colors.muted}
      value={codigoManual}
      onChangeText={setCodigoManual}
      style={{
        backgroundColor: colors.card,
        color: colors.text,
        padding: 14,
        borderRadius: 20,
        marginBottom: 10,
        fontSize: 16,
      }}
    />

    <Boton
      text="Conectar con código manual"
      color={colors.primary}
      onPress={async () => {
        if (!codigoManual.trim()) return;
        setCoupleId(codigoManual.trim());
        await AsyncStorage.setItem("couple_id", codigoManual.trim());
        setView("inicio");
      }}
    />
    {/* 🔼 FIN DEL INPUT MANUAL 🔼 */}
  </>
)}
        {scannerActive && hasCameraPermission && (
          <View style={{ flex: 1, marginTop: 20 }}>
            <BarCodeScanner
              style={{ flex: 1, borderRadius: 20, overflow: "hidden" }}
              onBarCodeScanned={manejarScan}
            />
            <View style={{ marginTop: 10 }}>
              <Boton
                text="Cancelar"
                color={colors.warning}
                onPress={() => setScannerActive(false)}
              />
            </View>
          </View>
        )}

        {coupleId && !scannerActive && (
          <View
            style={{
              marginTop: 30,
              alignItems: "center",
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: colors.text, marginBottom: 10 }}>
  Enseña este código a tu pareja:
</Text>

<QRCode value={coupleId} size={180} />

<Text
  style={{
    color: colors.muted,
    marginTop: 10,
    fontSize: 12,
  }}
>
  ID: {coupleId}
</Text>

<Text
  style={{
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "600",
    fontSize: 16,
  }}
>
  Cambiar vínculo
</Text>

<TextInput
  placeholder="Nuevo código de pareja"
  placeholderTextColor={colors.muted}
  value={codigoManual}
  onChangeText={setCodigoManual}
  style={{
    backgroundColor: colors.card,
    color: colors.text,
    padding: 14,
    borderRadius: 20,
    marginBottom: 10,
    fontSize: 16,
  }}
/>

<Boton
  text="Actualizar vínculo 🔄"
  color={colors.secondary}
  onPress={async () => {
    if (!codigoManual.trim()) return;
    await AsyncStorage.setItem("couple_id", codigoManual.trim());
    setCoupleId(codigoManual.trim());
    setCodigoManual("");
    setView("inicio");
  }}
/>

<Boton
  text="Crear vínculo nuevo ✨"
  color={colors.primary}
  onPress={async () => {
    const id = Math.random().toString(36).substring(2, 10);
    await AsyncStorage.setItem("couple_id", id);
    setCoupleId(id);
    setView("inicio");
  }}
/>

<Boton
  text="Desvincular pareja ❌"
  color={colors.warning}
  onPress={async () => {
    await AsyncStorage.removeItem("couple_id");
    setCoupleId(null);
    setView("vinculo");
  }}
/>

            <View style={{ marginTop: 20, width: "100%" }}>
              <Boton
                text="➡ Entrar a la app"
                color={colors.primary}
                onPress={() => setView("inicio")}
              />
            </View>
          </View>
        )}
      </Container>
    );
  }

  // ──────────────────────
  // ❤️ INICIO
  // ──────────────────────
  if (view === "inicio") {
    return (
      <Container>
        <Text
          style={{
            color: colors.primary,
            fontSize: 32,
            fontWeight: "800",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
          💕 PLANES V x A 💕
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          Elige juntos vuestro próximo plan
        </Text>

        <Boton
          text="🎡 Elegir plan"
          onPress={() => setView("ruleta")}
          color={colors.primary}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
          }}
        >
          <View style={{ flex: 1, marginRight: 6 }}>
            <Boton
              text="➕ Nuevo"
              onPress={() => setView("nuevo")}
              color={colors.secondary}
              small
            />
          </View>

          <View style={{ flex: 1, marginHorizontal: 6 }}>
            <Boton
              text="📆 Calendario"
              onPress={() => setView("calendario")}
              color={colors.success}
              small
            />
          </View>

          <View style={{ flex: 1, marginLeft: 6 }}>
            <Boton
              text="🖼 Galería"
              onPress={() => setView("galeria")}
              color={colors.warning}
              small
            />
          </View>
        </View>

        <View style={{ marginTop: 30, alignItems: "center" }}>
          <Text
            style={{
              color: colors.muted,
              fontSize: 12,
              marginBottom: 6,
            }}
          >
            Pareja vinculada:
          </Text>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600" }}>
            {coupleId ?? "Sin vínculo"}
          </Text>
          <TouchableOpacity onPress={() => setView("vinculo")}>
            <Text style={{ color: colors.secondary, marginTop: 6, fontSize: 12 }}>
              Gestionar vínculo →
            </Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  // ──────────────────────
  // 🎡 RULETA
  // ──────────────────────
  if (view === "ruleta") {
    const girar = () => {
      if (planes.length === 0) {
        alert("No hay planes todavía, espabila y crea alguno 😅");
        return;
      }

      if (intentosRuleta >= 3 && planActual) {
        alert("Se acabaron los intentos. Este es tu plan final 🎯");
        return;
      }

      const random = planes[Math.floor(Math.random() * planes.length)];
      setPlanActual(random);
      setIntentosRuleta((prev) => prev + 1);
    };

    return (
      <ImageBackground
        source={require("../../assets/hearts-bg.png")}
        style={{ flex: 1, padding: 20 }}
        imageStyle={{ opacity: 0.12 }}
      >
        <Text
          style={{
            color: colors.primary,
            fontSize: 28,
            fontWeight: "800",
            marginBottom: 20,
          }}
        >
          🎡 Ruleta de planes
        </Text>

        {planActual && (
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                color: colors.secondary,
                fontSize: 18,
                textAlign: "center",
              }}
            >
              💰 {planActual.precio} €
            </Text>
            <Text
              style={{
                color: colors.secondary,
                fontSize: 18,
                textAlign: "center",
              }}
            >
              ⏳ {planActual.duracion} min
            </Text>
          </View>
        )}

        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 20,
            marginBottom: 20,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 2,
          }}
        >
          {!planActual ? (
            <Boton text="Girar ruleta 🎲" onPress={girar} color={colors.primary} />
          ) : (
            <>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 26,
                  fontWeight: "800",
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                {planActual.titulo}
              </Text>

              {intentosRuleta < 3 && (
                <Boton
                  text="Quiero otro 😈"
                  onPress={girar}
                  color={colors.secondary}
                />
              )}

              <Boton
                text="Este mola, lo guardo ❤️"
                onPress={() => setView("calendario")}
                color={colors.success}
              />
            </>
          )}
        </View>

        <Boton
          text="⬅ Volver"
          onPress={() => {
            setPlanActual(null);
            setIntentosRuleta(0);
            setView("inicio");
          }}
          color={colors.warning}
        />
      </ImageBackground>
    );
  }

  // ──────────────────────
  // ➕ NUEVO PLAN
  // ──────────────────────
  if (view === "nuevo") {
    return (
      <ImageBackground
        source={require("../../assets/hearts-bg.png")}
        style={{ flex: 1, padding: 20 }}
        imageStyle={{ opacity: 0.12 }}
      >
        <ScrollView>
          <Text
            style={{
              color: colors.primary,
              fontSize: 28,
              fontWeight: "800",
              marginBottom: 16,
            }}
          >
            ➕ Nuevo plan
          </Text>

          {/* TÍTULO */}
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
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          />

          {/* PRECIO */}
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
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          />

          {/* DURACIÓN */}
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
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          />

          {/* CATEGORÍA */}
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
            {["Romántico", "Barato", "Aventura", "Comida", "Cine", "Juegos", "Naturaleza"].map(
              (cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategoria(cat)}
                  style={{
                    backgroundColor: categoria === cat ? colors.primary : colors.card,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    marginRight: 10,
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 2,
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
              )
            )}
          </ScrollView>

          {/* GUARDAR */}
          <Boton
  text={editando ? "Guardar cambios ✏️" : "Guardar plan ❤️"}
  color={colors.primary}
  onPress={() => {
    if (!titulo.trim()) return;

    if (editando) {
      // MODO EDICIÓN
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

const contenidoActual = { planes, planesPorDia };

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

    // MODO CREAR
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
  }}
/>



          {/* LISTA DE PLANES EXISTENTES */}
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
  <View
    key={plan.id}
    style={{
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 20,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    }}
  >
    <Text
      style={{
        color: colors.text,
        fontSize: 18,
        fontWeight: "700",
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

    <TouchableOpacity
      onPress={() => {
        setPlanActual(plan);
        setIntentosRuleta(0);
        setView("calendario");
      }}
    >
      <Text style={{ color: colors.secondary, marginTop: 10 }}>
        Usar →
      </Text>
    </TouchableOpacity>

    {/* 🔽 BOTÓN EDITAR AQUÍ 🔽 */}
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
      <Text style={{ color: colors.primary, marginTop: 6 }}>
        Editar ✏️
      </Text>
    </TouchableOpacity>
    {/* 🔼 FIN BOTÓN EDITAR 🔼 */}
  </View>
))}


          <Boton
            text="⬅ Volver"
            color={colors.warning}
            onPress={() => setView("inicio")}
          />
        </ScrollView>
      </ImageBackground>
    );
  }
// ──────────────────────
// 📆 CALENDARIO
// ──────────────────────
if (view === "calendario") {
  const markedDates: any = {};

  Object.keys(planesPorDia).forEach((dia) => {
    markedDates[dia] = {
      marked: true,
      dotColor: colors.primary,
    };
  });

  if (planActual) {
    markedDates[new Date().toISOString().split("T")[0]] = {
      selected: true,
      selectedColor: colors.secondary,
    };
  }

  return (
    <ImageBackground
      source={require("../../assets/hearts-bg.png")}
      style={{ flex: 1, padding: 20 }}
      imageStyle={{ opacity: 0.12 }}
    >
      <Text
        style={{
          color: colors.primary,
          fontSize: 28,
          fontWeight: "800",
          padding: 20,
        }}
      >
        📆 Elige un día
      </Text>

      <Calendar
        onDayPress={(day) => {
          const fecha = day.dateString;

          // ─── Si estamos asignando un plan desde la ruleta ───
          if (planActual) {
            const nuevosPlanesDelDia = [
              ...(planesPorDia[fecha] || []),
              {
                planId: planActual.id,
                fotos: [],
                opinion: "",
                puntaje: 0,
                precio: planActual.precio || null,
                duracion: planActual.duracion || null,
              },
            ];

            // 1. Guardar en estado local
            setPlanesPorDia({
              ...planesPorDia,
              [fecha]: nuevosPlanesDelDia,
            });

            // 2. Guardar en Supabase
            guardarPlanesPorDia(fecha, nuevosPlanesDelDia, coupleId);

            // 3. Resetear estado
            setPlanActual(null);
            setIntentosRuleta(0);
            setView("inicio");
            return;
          }

          // ─── Si ya hay planes ese día, ir a la review ───
          if ((planesPorDia[fecha] || []).length > 0) {
            setFechaSeleccionada(fecha);
            setView("review");
          }
        }}
        markedDates={markedDates}
        theme={{
          backgroundColor: colors.bg,
          calendarBackground: colors.bg,
          textSectionTitleColor: colors.muted,
          dayTextColor: colors.text,
          monthTextColor: colors.text,
          arrowColor: colors.primary,
          todayTextColor: colors.secondary,
          dotColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: "#fff",
        }}
      />

      <View style={{ padding: 20 }}>
        <Boton
          text="⬅ Volver"
          onPress={() => {
            setPlanActual(null);
            setIntentosRuleta(0);
            setView("inicio");
          }}
          color={colors.warning}
        />
      </View>
    </ImageBackground>
  );
}

// ──────────────────────
// 📝 REVIEW
// ──────────────────────
if (view === "review" && fechaSeleccionada) {
  const lista = planesPorDia[fechaSeleccionada] || [];

  const actualizarPlan = (index: number, cambios: any) => {
    const nuevaLista = [...lista];
    nuevaLista[index] = { ...nuevaLista[index], ...cambios };

    // 1. Guardar en estado local
    setPlanesPorDia({
      ...planesPorDia,
      [fechaSeleccionada]: nuevaLista,
    });

    // 2. Guardar en Supabase
    guardarPlanesPorDia(fechaSeleccionada, nuevaLista, coupleId);
  };

  return (
    <ImageBackground
      source={require("../../assets/hearts-bg.png")}
      style={{ flex: 1, padding: 20 }}
      imageStyle={{ opacity: 0.12 }}
    >
      <ScrollView>
        <Text
          style={{
            color: colors.primary,
            fontSize: 28,
            fontWeight: "800",
            marginBottom: 20,
          }}
        >
          Planes del día {fechaSeleccionada}
        </Text>

        {lista.map((p: any, i: number) => {
          const planInfo = planes.find((pl) => pl.id === p.planId);

          return (
            <View
              key={i}
              style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 20,
                marginBottom: 20,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 22,
                  fontWeight: "800",
                  marginBottom: 10,
                }}
              >
                {planInfo?.titulo}
              </Text>

              {/* Opinión */}
              <TextInput
                placeholder="Opinión"
                placeholderTextColor={colors.muted}
                value={p.opinion || ""}
                onChangeText={(text) => actualizarPlan(i, { opinion: text })}
                style={{
                  backgroundColor: "#f3edf7",
                  color: colors.text,
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 12,
                }}
              />

              {/* EDITAR PRECIO */}
              <TextInput
                placeholder="Precio (€)"
                placeholderTextColor={colors.muted}
                value={p.precio || ""}
                onChangeText={(text) => actualizarPlan(i, { precio: text })}
                keyboardType="numeric"
                style={{
                  backgroundColor: "#f3edf7",
                  color: colors.text,
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 12,
                }}
              />

              {/* EDITAR DURACIÓN */}
              <TextInput
                placeholder="Duración (min)"
                placeholderTextColor={colors.muted}
                value={p.duracion || ""}
                onChangeText={(text) => actualizarPlan(i, { duracion: text })}
                keyboardType="numeric"
                style={{
                  backgroundColor: "#f3edf7",
                  color: colors.text,
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 12,
                }}
              />

              {/* Estrellas */}
              <View style={{ flexDirection: "row", marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => actualizarPlan(i, { puntaje: n })}
                  >
                    <Text style={{ fontSize: 28, marginRight: 6 }}>
                      {p.puntaje >= n ? "⭐" : "☆"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Fotos */}
              <TouchableOpacity
                onPress={async () => {
                  const img = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.8,
                  });

                  if (!img.canceled) {
                    const url = await uploadPhotoToSupabase(
                      img.assets[0].uri,
                      coupleId || "default"
                    );
                    if (url) {
                      actualizarPlan(i, {
                        fotos: [...(p.fotos || []), url],
                      });
                    } else {
                      alert("Error subiendo la foto 😭");
                    }
                  }
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    marginBottom: 12,
                    fontWeight: "600",
                  }}
                >
                  📸 Añadir foto
                </Text>
              </TouchableOpacity>

              <ScrollView horizontal>
                {p.fotos?.map((f: string, j: number) => (
                  <Image
                    key={j}
                    source={{ uri: f }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 10,
                      marginRight: 10,
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          );
        })}

        <Boton
          text="⬅ Volver"
          color={colors.warning}
          onPress={() => setView("calendario")}
        />
      </ScrollView>
    </ImageBackground>
  );
}

  // ──────────────────────
  // 🖼 GALERÍA
  // ──────────────────────
  if (view === "galeria") {
    const fotos: { uri: string; precio: any; duracion: any }[] = [];

    Object.entries(planesPorDia).forEach(([_, lista]: any) => {
      lista.forEach((p: any) => {
        p.fotos?.forEach((f: string) => {
          fotos.push({
            uri: f,
            precio: p.precio || null,
            duracion: p.duracion || null,
          });
        });
      });
    });

    const ordenadasPorPrecio = [...fotos].sort(
      (a, b) => (a.precio || 0) - (b.precio || 0)
    );

    const ordenadasPorDuracion = [...fotos].sort(
      (a, b) => (a.duracion || 0) - (b.duracion || 0)
    );

    return (
      <ImageBackground
        source={require("../../assets/hearts-bg.png")}
        style={{ flex: 1, padding: 20 }}
        imageStyle={{ opacity: 0.12 }}
      >
        <ScrollView>
          <Text
            style={{
              color: colors.primary,
              fontSize: 28,
              fontWeight: "800",
              marginBottom: 20,
            }}
          >
            Galería de recuerdos 💕
          </Text>

          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              marginBottom: 10,
            }}
          >
            🔽 Ordenadas por precio
          </Text>

          <ScrollView horizontal>
            {ordenadasPorPrecio.map((f, i) => (
              <Image
                key={`precio-${i}`}
                source={{ uri: f.uri }}
                style={{
                  width: 110,
                  height: 110,
                  marginRight: 10,
                  borderRadius: 16,
                }}
              />
            ))}
          </ScrollView>

          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              marginVertical: 10,
            }}
          >
            🔽 Ordenadas por duración
          </Text>

          <ScrollView horizontal>
            {ordenadasPorDuracion.map((f, i) => (
              <Image
                key={`duracion-${i}`}
                source={{ uri: f.uri }}
                style={{
                  width: 110,
                  height: 110,
                  marginRight: 10,
                  borderRadius: 16,
                }}
              />
            ))}
          </ScrollView>

          <Boton
            text="⬅ Volver"
            onPress={() => setView("inicio")}
            color={colors.warning}
          />
        </ScrollView>
      </ImageBackground>
    );
  }

  // ──────────────────────
  // SI NADA COINCIDE
  // ──────────────────────
  return null;
}
