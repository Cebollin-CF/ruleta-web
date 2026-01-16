import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarCodeScanner } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import colors from "../utils/colors";
import {
  guardarNotas,
  guardarNuevoPlan,
  guardarPlanesPorDia,
} from "../utils/supabaseHelpers";

import { supabase } from "../../supabaseClient";

// 📱 PANTALLAS
import CalendarioScreen from "../screens/CalendarioScreen";
import EstadisticasScreen from "../screens/EstadisticasScreen";
import GaleriaScreen from "../screens/GaleriaScreen";
import InicioScreen from "../screens/InicioScreen";
import NotasScreen from "../screens/NotasScreen";
import NuevoPlanScreen from "../screens/NuevoPlanScreen";
import ReviewScreen from "../screens/ReviewScreen";
import RuletaScreen from "../screens/RuletaScreen";
import TimelineScreen from "../screens/TimelineScreen";
import VinculoScreen from "../screens/VinculoScreen";

// 📤 SUBIR FOTO A SUPABASE
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

    if (error) return null;

    const { data: publicData } = supabase.storage
      .from("fotos")
      .getPublicUrl(fileName);

    return publicData?.publicUrl ?? null;
  } catch {
    return null;
  }
}

export default function Index() {
  // 📌 ESTADOS GLOBALES
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<
    | "vinculo"
    | "inicio"
    | "ruleta"
    | "nuevo"
    | "calendario"
    | "review"
    | "galeria"
    | "notas"
    | "estadisticas"
    | "timeline"
  >("vinculo");

  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [planes, setPlanes] = useState<any[]>([]);
  const [planesPorDia, setPlanesPorDia] = useState<any>({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(
    null
  );

  const [intentosRuleta, setIntentosRuleta] = useState(0);
  const [planActual, setPlanActual] = useState<any | null>(null);

  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("");
  const [categoria, setCategoria] = useState("");

  const [codigoManual, setCodigoManual] = useState("");
  const [editando, setEditando] = useState(false);
  const [planEditandoId, setPlanEditandoId] = useState(null);

  const [hasCameraPermission, setHasCameraPermission] =
    useState<boolean | null>(null);
  const [scannerActive, setScannerActive] = useState(false);

  const [notas, setNotas] = useState<any[]>([]);
  const [notaTexto, setNotaTexto] = useState("");
  const [notaCategoria] = useState("General");

  const [stats, setStats] = useState<any>({
    totalPlanes: 0,
    categorias: {},
    diasConPlanes: 0,
    totalFotos: 0,
    totalDuracion: 0,
  });

  // 🔄 CARGAR ID DE PAREJA
  useEffect(() => {
    const init = async () => {
      try {
        const savedCoupleId = await AsyncStorage.getItem("couple_id");
        if (savedCoupleId) {
          setCoupleId(savedCoupleId);
          setView("inicio");
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 🔄 CARGAR ESTADO DESDE SUPABASE
  useEffect(() => {
    if (!coupleId) return;

    const cargar = async () => {
      const { data } = await supabase
        .from("app_state")
        .select("contenido")
        .eq("id", coupleId)
        .single();

      if (data?.contenido) {
        setPlanes(data.contenido.planes || []);
        setPlanesPorDia(data.contenido.planesPorDia || {});
        setNotas(data.contenido.notas || []);
      } else {
        await supabase.from("app_state").upsert({
          id: coupleId,
          contenido: { planes: [], planesPorDia: {}, notas: [] },
        });
      }
    };

    cargar();
  }, [coupleId]);

  // 🔄 SINCRONIZACIÓN EN TIEMPO REAL
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
            setNotas(contenido.notas || []);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [coupleId]);

  // 📊 ESTADÍSTICAS
  useEffect(() => {
    const categoriasCount: any = {};
    let totalFotos = 0;
    let totalDuracion = 0;
    let diasConPlanes = 0;

    Object.keys(planesPorDia).forEach((dia) => {
      const lista = planesPorDia[dia] || [];
      if (lista.length > 0) diasConPlanes++;

      lista.forEach((p) => {
        if (p.fotos) totalFotos += p.fotos.length;
        if (p.duracion) totalDuracion += Number(p.duracion);

        const planInfo = planes.find((pl) => pl.id === p.planId);
        if (planInfo?.categoria) {
          categoriasCount[planInfo.categoria] =
            (categoriasCount[planInfo.categoria] || 0) + 1;
        }
      });
    });

    setStats({
      totalPlanes: planes.length,
      categorias: categoriasCount,
      diasConPlanes,
      totalFotos,
      totalDuracion,
    });
  }, [planes, planesPorDia]);

  // 🔔 PERMISOS NOTIFICACIONES
  useEffect(() => {
    Notifications.requestPermissionsAsync().catch(() => {});
  }, []);

  // ⏳ LOADING
  if (loading) {
    return (
      <LinearGradient
        colors={[colors.bgTop, colors.bgBottom]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </LinearGradient>
    );
  }

  // 🧭 NAVEGACIÓN ENTRE PANTALLAS

  // 👉 VÍNCULO
  if (view === "vinculo") {
    return (
      <VinculoScreen
        setView={setView}
        coupleId={coupleId}
        scannerActive={scannerActive}
        hasCameraPermission={hasCameraPermission}
        codigoManual={codigoManual}
        setCodigoManual={setCodigoManual}
        pedirPermisoCamara={async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasCameraPermission(status === "granted");
          if (status === "granted") setScannerActive(true);
        }}
        crearPareja={async () => {
          const id = Math.random().toString(36).substring(2, 10);
          setCoupleId(id);
          await AsyncStorage.setItem("couple_id", id);
          setView("inicio");
        }}
        manejarScan={async ({ data }) => {
          setScannerActive(false);
          if (!data) return;
          setCoupleId(data);
          await AsyncStorage.setItem("couple_id", data);
          setView("inicio");
        }}
      />
    );
  }

  // 👉 INICIO
  if (view === "inicio") {
    return <InicioScreen setView={setView} coupleId={coupleId} />;
  }

  // 👉 RULETA
  if (view === "ruleta") {
    const girar = () => {
      if (planes.length === 0) {
        alert("No hay planes todavía");
        return;
      }

      if (intentosRuleta >= 3 && planActual) {
        alert("Se acabaron los intentos");
        return;
      }

      const random = planes[Math.floor(Math.random() * planes.length)];
      setPlanActual(random);
      setIntentosRuleta((prev) => prev + 1);
    };

    return (
      <RuletaScreen
        setView={setView}
        planes={planes}
        planActual={planActual}
        girar={girar}
        intentosRuleta={intentosRuleta}
      />
    );
  }

  // 👉 NUEVO PLAN
  if (view === "nuevo") {
    return (
      <NuevoPlanScreen
        setView={setView}
        planes={planes}
        setPlanes={setPlanes}
        titulo={titulo}
        setTitulo={setTitulo}
        precio={precio}
        setPrecio={setPrecio}
        duracion={duracion}
        setDuracion={setDuracion}
        categoria={categoria}
        setCategoria={setCategoria}
        editando={editando}
        setEditando={setEditando}
        planEditandoId={planEditandoId}
        setPlanEditandoId={setPlanEditandoId}
        guardarNuevoPlan={guardarNuevoPlan}
        coupleId={coupleId}
        planesPorDia={planesPorDia}
        notas={notas}
      />
    );
  }

  // 👉 CALENDARIO
  if (view === "calendario") {
    const markedDates = {};
    Object.keys(planesPorDia).forEach((dia) => {
      markedDates[dia] = { marked: true, dotColor: colors.primary };
    });

    if (planActual) {
      markedDates[new Date().toISOString().split("T")[0]] = {
        selected: true,
        selectedColor: colors.secondary,
      };
    }

    const onDayPress = (day) => {
      const fecha = day.dateString;

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

        setPlanesPorDia({
          ...planesPorDia,
          [fecha]: nuevosPlanesDelDia,
        });

        guardarPlanesPorDia(fecha, nuevosPlanesDelDia, coupleId);

        setPlanActual(null);
        setIntentosRuleta(0);
        setView("inicio");
        return;
      }

      if ((planesPorDia[fecha] || []).length > 0) {
        setFechaSeleccionada(fecha);
        setView("review");
      }
    };

    return (
      <CalendarioScreen
        setView={setView}
        markedDates={markedDates}
        onDayPress={onDayPress}
      />
    );
  }

  // 👉 REVIEW
  if (view === "review" && fechaSeleccionada) {
    const lista = planesPorDia[fechaSeleccionada] || [];

    const actualizarPlan = (index, cambios) => {
      const nuevaLista = [...lista];
      nuevaLista[index] = { ...nuevaLista[index], ...cambios };

      setPlanesPorDia({
        ...planesPorDia,
        [fechaSeleccionada]: nuevaLista,
      });

      guardarPlanesPorDia(fechaSeleccionada, nuevaLista, coupleId);
    };

    const subirFoto = async (index) => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const url = await uploadPhotoToSupabase(result.assets[0].uri, coupleId);
        if (!url) return;

        const nuevasFotos = [...(lista[index].fotos || []), url];
        actualizarPlan(index, { fotos: nuevasFotos });
      }
    };

    return (
      <ReviewScreen
        setView={setView}
        fechaSeleccionada={fechaSeleccionada}
        lista={lista}
        actualizarPlan={actualizarPlan}
        subirFoto={subirFoto}
        planes={planes}
      />
    );
  }

  // 👉 NOTAS
  if (view === "notas") {
    const guardarNotaLocal = async () => {
      if (!notaTexto.trim()) return;

      const nuevaNota = {
        id: Date.now().toString(),
        texto: notaTexto.trim(),
        categoria: notaCategoria,
        fecha: new Date().toISOString(),
      };

      const nuevas = [nuevaNota, ...notas];
      setNotas(nuevas);
      setNotaTexto("");

      await guardarNotas(nuevas, coupleId);
    };

    return (
      <NotasScreen
        setView={setView}
        notaTexto={notaTexto}
        setNotaTexto={setNotaTexto}
        notas={notas}
        guardarNota={guardarNotaLocal}
      />
    );
  }

  // 👉 ESTADÍSTICAS
  if (view === "estadisticas") {
    return <EstadisticasScreen setView={setView} stats={stats} />;
  }

  // 👉 TIMELINE
  if (view === "timeline") {
    const eventos = [];

    Object.keys(planesPorDia).forEach((fecha) => {
      const lista = planesPorDia[fecha] || [];
      lista.forEach((p) => {
        const planInfo = planes.find((pl) => pl.id === p.planId);
        eventos.push({
          fecha,
          titulo: planInfo?.titulo,
          opinion: p.opinion,
          puntaje: p.puntaje,
          fotos: p.fotos || [],
        });
      });
    });

    eventos.sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    return <TimelineScreen setView={setView} eventos={eventos} />;
  }

  // 👉 GALERÍA
  if (view === "galeria") {
    return <GaleriaScreen setView={setView} />;
  }

  // 🛑 FALLBACK
  return null;
}
