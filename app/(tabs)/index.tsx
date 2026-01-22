import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarCodeScanner } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

// IMPORT SUPABASE (ajusta la ruta si hace falta)
import { supabase } from "../../supabaseClient";

// PANTALLAS
import CalendarioScreen from "../screens/CalendarioScreen";
import EstadisticasScreen from "../screens/EstadisticasScreen";
import InicioScreen from "../screens/InicioScreen";
import NotasScreen from "../screens/NotasScreen";
import NuevoPlanScreen from "../screens/NuevoPlanScreen";
import ReviewScreen from "../screens/ReviewScreen";
import RuletaScreen from "../screens/RuletaScreen";
import TimelineScreen from "../screens/TimelineScreen";
import VinculoScreen from "../screens/VinculoScreen";

import colors from "../utils/colors";

// SUBIR FOTO A SUPABASE
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
  // ESTADOS GLOBALES
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<
    | "vinculo"
    | "inicio"
    | "ruleta"
    | "nuevo"
    | "calendario"
    | "review"
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

  // Toast simple para feedback visual
  const [toast, setToast] = useState<{ text: string; visible: boolean }>({
    text: "",
    visible: false,
  });

  const mostrarToast = (text: string) => {
    console.log("mostrarToast:", text);
    setToast({ text, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const [notaTexto, setNotaTexto] = useState("");
  const [notaCategoria] = useState("General");

  const [stats, setStats] = useState<any>({
    totalPlanes: 0,
    categorias: {},
    diasConPlanes: 0,
    totalFotos: 0,
    totalDuracion: 0,
  });

  // FUNCIONES DE PERSISTENCIA

  // guardarPlanesPorDia: actualiza local y persiste; devuelve promesa
  const guardarPlanesPorDia = async (fecha: string, nuevaLista: any[], coupleIdParam?: string) => {
    const id = coupleIdParam ?? coupleId;
    if (!id) {
      console.warn("guardarPlanesPorDia: no coupleId");
      return;
    }

    const nuevosPlanesPorDia = { ...planesPorDia };
    if (!nuevaLista || nuevaLista.length === 0) {
      delete nuevosPlanesPorDia[fecha];
    } else {
      nuevosPlanesPorDia[fecha] = nuevaLista;
    }

    // Actualizar estado local inmediatamente
    setPlanesPorDia(nuevosPlanesPorDia);
    console.log("guardarPlanesPorDia: local actualizado", Object.keys(nuevosPlanesPorDia));

    // Persistir en Supabase y esperar
    try {
      console.log("guardarPlanesPorDia: persistiendo...", fecha, nuevaLista?.length ?? 0);
      await supabase
        .from("app_state")
        .update({
          contenido: {
            planes,
            planesPorDia: nuevosPlanesPorDia,
            notas,
          },
        })
        .eq("id", id);
      console.log("guardarPlanesPorDia: persistencia OK");
    } catch (err) {
      console.error("guardarPlanesPorDia: error persistiendo", err);
      throw err;
    }
  };

  const guardarNotas = async (nuevasNotas: any[], coupleIdParam?: string) => {
    const id = coupleIdParam ?? coupleId;
    if (!id) return;

    setNotas(nuevasNotas);

    try {
      await supabase
        .from("app_state")
        .update({
          contenido: {
            planes,
            planesPorDia,
            notas: nuevasNotas,
          },
        })
        .eq("id", id);
    } catch (err) {
      console.error("Error guardando notas:", err);
    }
  };

  const guardarNuevoPlan = async (nuevoPlan: any, coupleIdParam?: string) => {
    const id = coupleIdParam ?? coupleId;
    if (!id) return;

    const nuevos = [nuevoPlan, ...planes];
    setPlanes(nuevos);

    try {
      await supabase
        .from("app_state")
        .update({
          contenido: {
            planes: nuevos,
            planesPorDia,
            notas,
          },
        })
        .eq("id", id);
    } catch (err) {
      console.error("Error guardando nuevo plan:", err);
    }
  };

  // eliminarPlanEnFecha (async) — función reutilizable
  const eliminarPlanEnFecha = async (indexEnDia: number) => {
    console.log("Index: eliminarPlanEnFecha llamado", indexEnDia, "fecha:", fechaSeleccionada);
    if (!fechaSeleccionada) {
      console.warn("Index: eliminarPlanEnFecha sin fechaSeleccionada");
      return;
    }

    const lista = planesPorDia[fechaSeleccionada] || [];
    const nuevaLista = lista.filter((_, idx) => idx !== indexEnDia);

    try {
      await guardarPlanesPorDia(fechaSeleccionada, nuevaLista, coupleId);
      console.log("Index: persistencia OK");
    } catch (err) {
      console.error("Index: error persistiendo en eliminarPlanEnFecha", err);
      throw err;
    }
  };

  // CARGAR ID DE PAREJA
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
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // CARGAR ESTADO DESDE SUPABASE
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

  // SINCRONIZACIÓN EN TIEMPO REAL
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

  // ESTADÍSTICAS
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

  // PERMISOS NOTIFICACIONES
  useEffect(() => {
    Notifications.requestPermissionsAsync().catch(() => {});
  }, []);

  // LOADING
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

  // PLANES USADOS
  const planesUsados: any[] = [];
  Object.keys(planesPorDia).forEach((dia) => {
    const lista = planesPorDia[dia] || [];
    lista.forEach((p) => {
      planesUsados.push(p);
    });
  });

  const usadosQueSiguen = planesUsados
    .filter((p) => p.seguirEnRuleta)
    .map((p) => p.planId);

  const noUsados = planes.filter(
    (p) => !planesUsados.some((u) => u.planId === p.id)
  );

  const usadosPermitidos = planes.filter((p) =>
    usadosQueSiguen.includes(p.id)
  );

  const planesDisponibles = [...noUsados, ...usadosPermitidos];

  // NAVEGACIÓN ENTRE PANTALLAS
  return (
    <View style={{ flex: 1 }}>
      {/* VÍNCULO */}
      {view === "vinculo" && (
        <VinculoScreen
          setView={setView}
          coupleId={coupleId}
          setCoupleId={setCoupleId}
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
            await supabase.from("app_state").upsert({
              id,
              contenido: { planes: [], planesPorDia: {}, notas: [] },
            });
            setView("inicio");
          }}
          manejarScan={async ({ data }) => {
            if (!data) return;
            setCoupleId(data);
            await AsyncStorage.setItem("couple_id", data);
            setScannerActive(false);
            setView("inicio");
          }}
        />
      )}

      {/* INICIO */}
      {view === "inicio" && (
        <InicioScreen setView={setView} coupleId={coupleId} />
      )}

      {/* RULETA */}
      {view === "ruleta" && (
        <RuletaScreen
          setView={setView}
          planes={planesDisponibles}
          planActual={planActual}
          girar={() => {
            if (planesDisponibles.length === 0) {
              alert("No hay planes disponibles");
              return;
            }

            const random =
              planesDisponibles[
                Math.floor(Math.random() * planesDisponibles.length)
              ];

            setPlanActual(random);
            setIntentosRuleta((prev) => prev + 1);
          }}
          intentosRuleta={intentosRuleta}
        />
      )}

      {/* NUEVO PLAN */}
      {view === "nuevo" && (
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
          setPlanActual={setPlanActual}
          setIntentosRuleta={setIntentosRuleta}
        />
      )}

      {/* CALENDARIO */}
      {view === "calendario" && (
        <CalendarioScreen
          setView={setView}
          markedDates={(() => {
            const marked: any = {};
            Object.keys(planesPorDia).forEach((dia) => {
              marked[dia] = { marked: true, dotColor: colors.primary };
            });
            return marked;
          })()}
          onDayPress={(day) => {
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
                  completado: false,
                  seguirEnRuleta: true,
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
          }}
        />
      )}

      {/* REVIEW */}
      {view === "review" && fechaSeleccionada && (
        <ReviewScreen
          setView={setView}
          fechaSeleccionada={fechaSeleccionada}
          lista={planesPorDia[fechaSeleccionada] || []}
          actualizarPlan={(index, cambios) => {
            const lista = planesPorDia[fechaSeleccionada] || [];
            const nuevaLista = [...lista];
            nuevaLista[index] = { ...nuevaLista[index], ...cambios };

            setPlanesPorDia({
              ...planesPorDia,
              [fechaSeleccionada]: nuevaLista,
            });

            guardarPlanesPorDia(fechaSeleccionada, nuevaLista, coupleId);
          }}
          subirFoto={async (index) => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });

            if (!result.canceled && result.assets?.[0]?.uri) {
              const url = await uploadPhotoToSupabase(
                result.assets[0].uri,
                coupleId
              );
              if (!url) return;

              const lista = planesPorDia[fechaSeleccionada] || [];
              const nuevasFotos = [...(lista[index].fotos || []), url];

              const nuevaLista = [...lista];
              nuevaLista[index] = { ...nuevaLista[index], fotos: nuevasFotos };

              setPlanesPorDia({
                ...planesPorDia,
                [fechaSeleccionada]: nuevaLista,
              });

              guardarPlanesPorDia(fechaSeleccionada, nuevaLista, coupleId);
            }
          }}
          planes={planes}
          setPlanes={setPlanes}
          coupleId={coupleId}
          planesPorDia={planesPorDia}
          notas={notas}
          eliminarPlanEnFecha={eliminarPlanEnFecha}
          mostrarToast={mostrarToast}
        />
      )}

      {/* NOTAS */}
      {view === "notas" && (
        <NotasScreen
          setView={setView}
          notaTexto={notaTexto}
          setNotaTexto={setNotaTexto}
          notas={notas}
          guardarNota={async () => {
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
          }}
        />
      )}

      {/* ESTADÍSTICAS */}
      {view === "estadisticas" && (
        <EstadisticasScreen setView={setView} stats={stats} />
      )}

      {/* TIMELINE */}
      {view === "timeline" && (
        <TimelineScreen
          setView={setView}
          eventos={(() => {
            const eventos: any[] = [];
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
            return eventos;
          })()}
        />
      )}

      {/* BOTÓN FLOTANTE DE ESTADÍSTICAS */}
      <TouchableOpacity
        onPress={() => setView("estadisticas")}
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          backgroundColor: colors.primary,
          width: 50,
          height: 50,
          borderRadius: 12,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        <Text style={{ fontSize: 24, color: "white" }}>📊</Text>
      </TouchableOpacity>

      {/* Toast simple */}
      {toast.visible && (
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: "rgba(0,0,0,0.8)",
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>{toast.text}</Text>
        </View>
      )}
    </View>
  );
}
