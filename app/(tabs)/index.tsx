import React, { useEffect, useState } from 'react';
// CORRECCIÓN: Se añade Alert para que funcionen los avisos y AsyncStorage
import { View, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

// RUTAS CORREGIDAS:
import colors from '../utils/colors';  // Desde app/utils/
import { supabase } from '../../supabaseClient';

// Pantallas
import CalendarioScreen from '../screens/CalendarioScreen';
import EstadisticasScreen from '../screens/EstadisticasScreen';
import InicioScreen from '../screens/InicioScreen';
import NotasScreen from '../screens/NotasScreen';
import NuevoPlanScreen from '../screens/NuevoPlanScreen';
import ReviewScreen from '../screens/ReviewScreen';
import RazonesScreen from '../screens/RazonesScreen';
import DesafiosScreen from '../screens/DesafiosScreen';
import MoodTrackerScreen from '../screens/MoodTrackerScreen';

// CORRECCIÓN: Importar las pantallas que faltaban para el renderScreen
import RuletaScreen from '../screens/RuletaScreen';
import VinculoScreen from '../screens/VinculoScreen';
import TimelineScreen from '../screens/TimelineScreen';
import AvatarScreen from '../screens/AvatarScreen';

// Hooks personalizados - RUTAS CORREGIDAS:
import { useAppState } from '../hooks/useAppState';
import { usePlanes } from '../hooks/usePlanes';
import { useRazones } from '../hooks/useRazones';
import { useMoodTracker } from '../hooks/useMoodTracker';
import { useNotas } from '../hooks/useNotas';
import { useDesafios } from '../hooks/useDesafios';

// Función para subir fotos
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
  // Hook para estado principal de la app
  const {
    loading,
    view,
    coupleId,
    fechaAniversario,
    toast,
    setView,
    setCoupleId,
    crearPareja,
    mostrarToast,
  } = useAppState();

  // Estados adicionales
  const [contenidoCompleto, setContenidoCompleto] = useState<any>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [codigoManual, setCodigoManual] = useState('');

  // Hooks para funcionalidades específicas
  const planesHook = usePlanes(coupleId);
  const razonesHook = useRazones(coupleId);
// En tu index.tsx, cambia la línea de moodHook por esta:
// Busca esto y déjalo EXACTAMENTE así:
const moodHook = useMoodTracker(
  coupleId, 
  contenidoCompleto?.moodHoy, 
  contenidoCompleto?.historialMoods
);
  const notasHook = useNotas(coupleId);
  const desafiosHook = useDesafios(coupleId);

  // Estados para formularios
  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [editando, setEditando] = useState(false);
  const [planEditandoId, setPlanEditandoId] = useState(null);
  const [notaTexto, setNotaTexto] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);

  // Cargar contenido desde Supabase
  useEffect(() => {
    if (!coupleId) return;

    const cargarContenido = async () => {
      const { data } = await supabase
        .from('app_state')
        .select('contenido')
        .eq('id', coupleId)
        .single();

      if (data?.contenido) {
        setContenidoCompleto(data.contenido);
        
        // Inicializar hooks con datos cargados
        planesHook.setPlanes(data.contenido.planes || []);
        planesHook.setPlanesPorDia(data.contenido.planesPorDia || {});
        razonesHook.setRazones(data.contenido.razones || []);
        razonesHook.setRazonDelDia(data.contenido.razonDelDia || null);
        moodHook.setHistorialMoods(data.contenido.historialMoods || []);
        moodHook.setMoodHoy(data.contenido.moodHoy || {});
        notasHook.setNotas(data.contenido.notas || []);
        desafiosHook.setDesafioActual(data.contenido.desafioActual || null);
        desafiosHook.setProgresoDesafio(data.contenido.progresoDesafio || 0);
      } else {
        // Si no existe, crear registro vacío
        await supabase.from("app_state").upsert({
          id: coupleId,
          contenido: {
            planes: [],
            planesPorDia: {},
            notas: [],
            avatarUrl: null,
            fechaAniversario: null,
            razones: [],
            desafioActual: null,
            progresoDesafio: 0,
            historialMoods: [],
            moodHoy: {},
          },
        });
      }
    };

    cargarContenido();
  }, [coupleId]);

  // Sincronización en tiempo real con Supabase
  useEffect(() => {
    if (!coupleId) return;

    const channel = supabase
      .channel(`app_state_${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_state',
          filter: `id=eq.${coupleId}`,
        },
        (payload) => {
          if (payload.new?.contenido) {
            setContenidoCompleto(payload.new.contenido);
            // Actualizar hooks con nuevos datos
            planesHook.setPlanes(payload.new.contenido.planes || []);
            planesHook.setPlanesPorDia(payload.new.contenido.planesPorDia || {});
            razonesHook.setRazones(payload.new.contenido.razones || []);
            razonesHook.setRazonDelDia(payload.new.contenido.razonDelDia || null);
            moodHook.setHistorialMoods(payload.new.contenido.historialMoods || []);
            moodHook.setMoodHoy(payload.new.contenido.moodHoy || {});
            notasHook.setNotas(payload.new.contenido.notas || []);
            desafiosHook.setDesafioActual(payload.new.contenido.desafioActual || null);
            desafiosHook.setProgresoDesafio(payload.new.contenido.progresoDesafio || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // Función para subir avatar
  const subirAvatar = async (uri: string) => {
    if (!coupleId) {
      mostrarToast("No hay pareja vinculada");
      return;
    }

    const url = await uploadPhotoToSupabase(uri, coupleId);
    if (!url) {
      mostrarToast("Error al subir foto");
      return;
    }

    try {
      await supabase
        .from("app_state")
        .update({
          contenido: {
            ...contenidoCompleto,
            avatarUrl: url,
          },
        })
        .eq("id", coupleId);
      mostrarToast("Foto actualizada ✨");
    } catch (err) {
      console.error("Error guardando avatar:", err);
    }
  };

  // Función para manejar escaneo QR
  const manejarScan = async ({ data }) => {
    if (!data) return;
    
    try {
      const { data: parejaData } = await supabase
        .from("app_state")
        .select("id")
        .eq("id", data)
        .single();

      if (parejaData) {
        setCoupleId(data);
        await AsyncStorage.setItem("couple_id", data);
        setScannerActive(false);
        setView("inicio");
        mostrarToast("Pareja vinculada exitosamente 💕");
      } else {
        mostrarToast("Código inválido");
      }
    } catch (error) {
      mostrarToast("Error al vincular pareja");
    }
  };

  // Función para pedir permiso de cámara
  const pedirPermisoCamara = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasCameraPermission(status === "granted");
    if (status === "granted") setScannerActive(true);
  };

  // Calcular estadísticas
  const [stats, setStats] = useState({
    totalPlanes: 0,
    diasConPlanes: 0,
    totalFotos: 0,
  });

  useEffect(() => {
    const totalPlanes = planesHook.planes.length;
    const diasConPlanes = Object.keys(planesHook.planesPorDia).length;

    let totalFotos = 0;
    Object.values(planesHook.planesPorDia).forEach((lista: any) => {
      lista.forEach((plan: any) => {
        totalFotos += (plan.fotos || []).length;
      });
    });

    setStats({
      totalPlanes,
      diasConPlanes,
      totalFotos,
    });
  }, [planesHook.planes, planesHook.planesPorDia]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Renderizar pantalla actual
  const renderScreen = () => {
    switch (view) {
      case 'vinculo':
        return (
          <VinculoScreen
            setView={setView}
            coupleId={coupleId}
            setCoupleId={setCoupleId}
            scannerActive={scannerActive}
            hasCameraPermission={hasCameraPermission}
            codigoManual={codigoManual}
            setCodigoManual={setCodigoManual}
            pedirPermisoCamara={pedirPermisoCamara}
            crearPareja={crearPareja}
            manejarScan={manejarScan}
            mostrarToast={mostrarToast}
          />
        );

      case 'inicio':
        return (
          <InicioScreen
            setView={setView}
            coupleId={coupleId}
            fechaAniversario={fechaAniversario}
            razonDelDia={razonesHook.razonDelDia}
            avatarUrl={contenidoCompleto?.avatarUrl}
          />
        );

      case 'razones':
        return (
          <RazonesScreen
            setView={setView}
            razones={razonesHook.razones}
            agregarRazon={razonesHook.agregarRazon}
            eliminarRazon={razonesHook.eliminarRazon}
            editarRazon={razonesHook.editarRazon}
            razonDelDia={razonesHook.razonDelDia}
          />
        );

      case 'mood':
        return (
          <MoodTrackerScreen
            setView={setView}
            registrarMood={moodHook.registrarMood}
            historialMoods={moodHook.historialMoods}
            moodHoy={moodHook.moodHoy}
            eliminarMood={moodHook.eliminarMood}
            cambiarMoodHoy={moodHook.cambiarMoodHoy}
          />
        );

      case 'ruleta':
        return (
          <RuletaScreen
            setView={setView}
            planes={planesHook.planes.filter(p => !p.completado)}
            planActual={planesHook.planActual}
            girar={() => {
              const resultado = planesHook.girarRuleta();
              if (!resultado) {
                Alert.alert("Sin planes", "No hay planes disponibles. Crea algunos primero.");
              }
            }}
            intentosRuleta={planesHook.intentosRuleta}
          />
        );

      case 'nuevo':
        return (
          <NuevoPlanScreen
            setView={setView}
            planes={planesHook.planes}
            setPlanes={planesHook.setPlanes}
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
            guardarNuevoPlan={planesHook.agregarPlan}
            coupleId={coupleId}
            planesPorDia={planesHook.planesPorDia}
            notas={notasHook.notas}
            setPlanActual={planesHook.setPlanActual}
            setIntentosRuleta={planesHook.setIntentosRuleta}
          />
        );

      case 'calendario':
        return (
          <CalendarioScreen
            setView={setView}
            markedDates={(() => {
              const marked: any = {};
              Object.keys(planesHook.planesPorDia).forEach((dia) => {
                marked[dia] = { marked: true, dotColor: colors.primary };
              });
              return marked;
            })()}
            onDayPress={(day) => {
              const fecha = day.dateString;

              if (planesHook.planActual) {
                const nuevosPlanesDelDia = [
                  ...(planesHook.planesPorDia[fecha] || []),
                  {
                    planId: planesHook.planActual.id,
                    fotos: [],
                    opinion: "",
                    puntaje: 0,
                    precio: planesHook.planActual.precio || null,
                    duracion: planesHook.planActual.duracion || null,
                    completado: false,
                    seguirEnRuleta: true,
                  },
                ];

                planesHook.guardarPlanesPorDia(fecha, nuevosPlanesDelDia);

                planesHook.setPlanActual(null);
                planesHook.setIntentosRuleta(0);
                setView("inicio");
                return;
              }

              // Si el día YA tiene planes, ir a REVIEW
              if ((planesHook.planesPorDia[fecha] || []).length > 0) {
                setFechaSeleccionada(fecha);
                setView("review");
              } else {
                // Si el día NO tiene planes, mostrar opción
                Alert.alert(
                  "Día sin planes",
                  "Este día no tiene planes asignados. ¿Quieres agregar uno desde la ruleta?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Ir a ruleta",
                      onPress: () => {
                        setFechaSeleccionada(fecha);
                        setView("ruleta");
                      },
                    },
                  ]
                );
              }
            }}
          />
        );

      case 'review':
        return fechaSeleccionada && (
          <ReviewScreen
            setView={setView}
            fechaSeleccionada={fechaSeleccionada}
            lista={planesHook.planesPorDia[fechaSeleccionada] || []}
            actualizarPlan={(index, cambios) => {
              const lista = planesHook.planesPorDia[fechaSeleccionada] || [];
              const nuevaLista = [...lista];
              nuevaLista[index] = { ...nuevaLista[index], ...cambios };

              planesHook.guardarPlanesPorDia(fechaSeleccionada, nuevaLista);
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

                const lista = planesHook.planesPorDia[fechaSeleccionada] || [];
                const nuevasFotos = [...(lista[index].fotos || []), url];

                const nuevaLista = [...lista];
                nuevaLista[index] = { ...nuevaLista[index], fotos: nuevasFotos };

                planesHook.guardarPlanesPorDia(fechaSeleccionada, nuevaLista);
              }
            }}
            planes={planesHook.planes}
            eliminarPlanEnFecha={async (indexEnDia) => {
              const lista = planesHook.planesPorDia[fechaSeleccionada] || [];
              const nuevaLista = lista.filter((_, idx) => idx !== indexEnDia);
              await planesHook.guardarPlanesPorDia(fechaSeleccionada, nuevaLista);
              mostrarToast("Plan eliminado");
            }}
            mostrarToast={mostrarToast}
          />
        );

      case 'notas':
        return (
          <NotasScreen
            setView={setView}
            notaTexto={notaTexto}
            setNotaTexto={setNotaTexto}
            notas={notasHook.notas}
            guardarNota={notasHook.agregarNota}
            eliminarNota={notasHook.eliminarNota}
            editarNota={notasHook.editarNota}
          />
        );

      case 'estadisticas':
        return (
          <EstadisticasScreen 
            setView={setView} 
            stats={stats} 
          />
        );

      case 'timeline':
        return (
          <TimelineScreen
            setView={setView}
            eventos={(() => {
              const eventos: any[] = [];
              Object.keys(planesHook.planesPorDia).forEach((fecha) => {
                const lista = planesHook.planesPorDia[fecha] || [];
                lista.forEach((p) => {
                  const planInfo = planesHook.planes.find((pl) => pl.id === p.planId);
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
        );

      case 'avatar':
        return (
          <AvatarScreen
            setView={setView}
            avatarUrl={contenidoCompleto?.avatarUrl}
            subirAvatar={subirAvatar}
          />
        );

      case 'desafios':
        return (
          <DesafiosScreen
            setView={setView}
            desafioActual={desafiosHook.desafioActual}
            progreso={desafiosHook.progresoDesafio}
            completarDesafio={desafiosHook.completarDesafio}
            generarNuevoDesafio={desafiosHook.generarNuevoDesafio}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}

      {/* Botón flotante de estadísticas */}
      {view !== 'estadisticas' && view !== 'vinculo' && (
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
            borderWidth: 2,
            borderColor: "#FFB3D1",
            zIndex: 100,
          }}
        >
          <Text style={{ fontSize: 24, color: "white" }}>📊</Text>
        </TouchableOpacity>
      )}

      {/* Toast simple */}
      {toast.visible && (
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: 'rgba(0,0,0,0.8)',
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.primary,
            zIndex: 1000,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>{toast.text}</Text>
        </View>
      )}
    </View>
  );
}