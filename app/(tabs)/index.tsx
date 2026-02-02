import React, { useEffect, useState } from 'react';
// CORRECCIÓN: Se añade Alert para que funcionen los avisos y AsyncStorage
import { View, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

// RUTAS CORREGIDAS:
import colors from '../utils/colors';  // Desde app/utils/
import { supabase } from '../../supabaseClient';

// Importaciones de mascota (sin duplicados)
import MascotaScreen from '../screens/MascotaScreen';
import { useMascota } from '../hooks/useMascota';

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
import RuletaScreen from '../screens/RuletaScreen';
import VinculoScreen from '../screens/VinculoScreen';
import TimelineScreen from '../screens/TimelineScreen';
import AvatarScreen from '../screens/AvatarScreen';
import LogrosScreen from '../screens/LogrosScreen';

// Hooks personalizados - RUTAS CORREGIDAS:
import { useAppState } from '../hooks/useAppState';
import { usePlanes } from '../hooks/usePlanes';
import { useRazones } from '../hooks/useRazones';
import { useMoodTracker } from '../hooks/useMoodTracker';
import { useNotas } from '../hooks/useNotas';
import { useDesafios } from '../hooks/useDesafios';
import { useLogros } from '../hooks/useLogros';

/// ✅ FUNCIÓN CORREGIDA PARA SUBIR FOTOS
async function uploadPhotoToSupabase(uri: string, coupleId: string, esAvatar = false) {
  try {
    console.log("📸 Iniciando subida de foto...");
    
    const response = await fetch(uri);
    if (!response.ok) throw new Error("Error al obtener la imagen");
    
    const blob = await response.blob();
    
    // Nombre diferente para avatar
    const fileName = esAvatar 
      ? `${coupleId}/avatar_${Date.now()}.jpg`
      : `${coupleId}/photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;

    // Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("fotos")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: true
      });

    if (uploadError) {
      console.error("❌ Error subiendo a storage:", uploadError);
      throw uploadError;
    }

    // Obtener URL pública
    const { data: publicData } = supabase.storage
      .from("fotos")
      .getPublicUrl(fileName);

    console.log("✅ Foto subida correctamente:", publicData?.publicUrl);
    return publicData?.publicUrl;
    
  } catch (error) {
    console.error("❌ Error en uploadPhotoToSupabase:", error);
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
    conectarPareja,
    mostrarToast,
    setFechaAniversario,
  } = useAppState();

  // Estados adicionales
  const [contenidoCompleto, setContenidoCompleto] = useState<any>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [codigoManual, setCodigoManual] = useState('');

  // Hooks para funcionalidades específicas
  const planesHook = usePlanes(coupleId);
  const razonesHook = useRazones(coupleId);
  const moodHook = useMoodTracker(
    coupleId, 
    contenidoCompleto?.moodHoy, 
    contenidoCompleto?.historialMoods
  );
  const notasHook = useNotas(coupleId);
  const desafiosHook = useDesafios(coupleId);
  const logrosHook = useLogros(
    coupleId,
    contenidoCompleto?.puntos || 0,
    contenidoCompleto?.logrosDesbloqueados || []
  );

  // Hook de mascota
  const mascotaHook = useMascota(
    coupleId, 
    logrosHook.puntos || 0,
    contenidoCompleto?.mascota,
    logrosHook
  );

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
        logrosHook.setLogrosDesbloqueados(data.contenido.logrosDesbloqueados || []); 
        logrosHook.setPuntos(data.contenido.puntos || 0);
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
            logrosHook.setLogrosDesbloqueados(payload.new.contenido.logrosDesbloqueados || []);
            logrosHook.setPuntos(payload.new.contenido.puntos || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleId]);

  // ✅ FUNCIÓN CORREGIDA PARA SUBIR AVATAR
  const subirAvatar = async (uri: string) => {
    if (!coupleId) {
      mostrarToast("❌ No hay pareja vinculada", "error");
      return;
    }

    mostrarToast("📸 Subiendo foto...", "info");

    try {
      const url = await uploadPhotoToSupabase(uri, coupleId, true); // true = es avatar
      
      if (!url) {
        mostrarToast("❌ Error al subir foto", "error");
        return;
      }

      // Obtener contenido actual
      const { data: registro } = await supabase
        .from("app_state")
        .select("contenido")
        .eq("id", coupleId)
        .single();

      const contenidoActual = registro?.contenido || {};

      // Actualizar en Supabase
      const { error } = await supabase
        .from("app_state")
        .update({
          contenido: {
            ...contenidoActual,
            avatarUrl: url,
          },
        })
        .eq("id", coupleId);

      if (error) {
        console.error("Error guardando avatar:", error);
        mostrarToast("❌ Error al guardar foto", "error");
        return;
      }

      // Actualizar estado local
      setContenidoCompleto(prev => ({
        ...prev,
        avatarUrl: url
      }));

      mostrarToast("✅ Foto de perfil actualizada ✨");
      
    } catch (err) {
      console.error("Error en subirAvatar:", err);
      mostrarToast("❌ Error al guardar foto", "error");
    }
  };

  // Función para manejar escaneo QR
  const manejarScan = async ({ data }) => {
    if (!data) return;
    const res = await conectarPareja(data);
    if (res?.success) {
      setScannerActive(false);
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

  // Función para actualizar logros automáticamente
  const actualizarLogrosAutomaticamente = async (mostrarNotificaciones = true) => {
    const diasJuntos = fechaAniversario 
      ? Math.floor((new Date().getTime() - new Date(fechaAniversario).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const datosUsuario = {
      totalPlanesCompletados: planesHook.planes.filter(p => p.completado).length,
      diasJuntos: diasJuntos,
      totalFotos: stats.totalFotos,
      totalRazones: razonesHook.razones.length,
      diasConPlanes: stats.diasConPlanes,
      desafiosCompletados: 0,
    };

    const resultado = await logrosHook.actualizarLogros(datosUsuario, mostrarNotificaciones);
    
    if (resultado?.notificaciones?.length > 0 && mostrarNotificaciones) {
      resultado.notificaciones.forEach(notif => {
        mostrarToast(`🏆 ${notif.titulo}! (+${notif.puntos} pts)`);
      });
    }
    
    return resultado;
  };

  // ✅ Cargar logros al inicio SIN notificaciones
  useEffect(() => {
    if (coupleId && !loading && contenidoCompleto) {
      const cargarLogrosIniciales = async () => {
        const diasJuntos = fechaAniversario 
          ? Math.floor((new Date().getTime() - new Date(fechaAniversario).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        const datosUsuarioInicial = {
          totalPlanesCompletados: planesHook.planes.filter(p => p.completado).length,
          diasJuntos: diasJuntos,
          totalFotos: stats.totalFotos,
          totalRazones: razonesHook.razones.length,
          diasConPlanes: stats.diasConPlanes,
          desafiosCompletados: 0,
        };

        await logrosHook.actualizarLogros(datosUsuarioInicial, false);
      };
      
      cargarLogrosIniciales();
    }
  }, [coupleId, loading, contenidoCompleto]);

  // ✅ Este efecto SÍ mostrará notificaciones cuando haya cambios reales
  useEffect(() => {
    if (coupleId && !loading) {
      const timeoutId = setTimeout(() => {
        actualizarLogrosAutomaticamente(true);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [stats.totalPlanes, stats.totalFotos, razonesHook.razones.length]);

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
            conectarPareja={conectarPareja}
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
            puntos={logrosHook.puntos}
          />
        );

      case 'mascota':
        return (
          <MascotaScreen
            setView={setView}
            mascotaHook={mascotaHook}
            puntosTotales={logrosHook.puntos || 0}
            mostrarToast={mostrarToast} // ✅ AÑADIDA ESTA PROP
          />
        );

      case 'razones':
        return (
          <RazonesScreen
            setView={setView}
            razones={razonesHook.razones}
            agregarRazon={async (texto) => {
              const result = await razonesHook.agregarRazon(texto);
              if (result?.success) {
                mostrarToast("💝 Razón agregada");
              } else {
                mostrarToast("❌ Error al agregar razón", "error");
              }
              return result;
            }}
            eliminarRazon={async (razonId) => {
              const result = await razonesHook.eliminarRazon(razonId);
              if (result?.success) {
                mostrarToast("🗑️ Razón eliminada");
              } else {
                mostrarToast("❌ Error al eliminar razón", "error");
              }
              return result;
            }}
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
            guardarNuevoPlan={async (nuevoPlan) => {
              const success = await planesHook.agregarPlan(nuevoPlan);
              if (success) {
                mostrarToast("✅ Plan creado exitosamente");
              } else {
                mostrarToast("❌ Error al crear plan", "error");
              }
              return success;
            }}
            coupleId={coupleId}
            planesPorDia={planesHook.planesPorDia}
            notas={notasHook.notas}
            setPlanActual={planesHook.setPlanActual}
            setIntentosRuleta={planesHook.setIntentosRuleta}
            planTieneFecha={planesHook.planTieneFecha}
          />
        );

      case 'calendario':
        return (
          <CalendarioScreen
            setView={setView}
            markedDates={(() => {
              const marked: any = {};
              Object.keys(planesHook.planesPorDia).forEach((dia) => {
                marked[dia] = { 
                  marked: true, 
                  dotColor: colors.primary,
                };
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

              if ((planesHook.planesPorDia[fecha] || []).length > 0) {
                setFechaSeleccionada(fecha);
                setView("review");
              } else {
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
            fechaAniversario={fechaAniversario}
            setFechaAniversario={(nuevaFecha) => {
              if (typeof setFechaAniversario === 'function') {
                setFechaAniversario(nuevaFecha);
              }
              
              AsyncStorage.setItem('fecha_aniversario', nuevaFecha)
                .then(() => console.log('Fecha guardada en AsyncStorage:', nuevaFecha))
                .catch(err => console.error('Error guardando fecha:', err));
              
              if (coupleId && contenidoCompleto) {
                supabase
                  .from('app_state')
                  .update({
                    contenido: {
                      ...contenidoCompleto,
                      fechaAniversario: nuevaFecha,
                    },
                  })
                  .eq('id', coupleId)
                  .then(() => {
                    mostrarToast("✅ Fecha actualizada en la nube");
                  })
                  .catch(error => {
                    console.error("Error actualizando fecha en Supabase:", error);
                    mostrarToast("⚠️ Error en la nube, pero guardado localmente");
                  });
              }
              
              try {
                const inicio = new Date(nuevaFecha);
                const hoy = new Date();
                inicio.setHours(0, 0, 0, 0);
                hoy.setHours(0, 0, 0, 0);
                
                const diferenciaMs = hoy.getTime() - inicio.getTime();
                const diasJuntos = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
                
                mostrarToast(`📅 Fecha actualizada: ${diasJuntos} días juntos`);
              } catch (e) {
                console.error('Error calculando días:', e);
                mostrarToast("✅ Fecha actualizada");
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
            actualizarPlan={async (index, cambios) => {
              try {
                const lista = planesHook.planesPorDia[fechaSeleccionada] || [];
                const nuevaLista = [...lista];
                nuevaLista[index] = { ...nuevaLista[index], ...cambios };
                
                const success = await planesHook.guardarPlanesPorDia(fechaSeleccionada, nuevaLista);
                
                if (success) {
                  mostrarToast("✅ Cambios guardados");
                } else {
                  mostrarToast("❌ Error al guardar", "error");
                }
              } catch (error) {
                console.error("Error al actualizar plan:", error);
                mostrarToast("❌ Error al guardar cambios", "error");
              }
            }}
            subirFoto={async (index) => {
              try {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  quality: 0.7,
                });
                
                if (!result.canceled && result.assets?.[0]?.uri) {
                  mostrarToast("📸 Subiendo foto...", "info");
                  
                  const url = await uploadPhotoToSupabase(result.assets[0].uri, coupleId, false);
                  if (!url) {
                    mostrarToast("❌ Error al subir foto", "error");
                    return;
                  }
                  
                  const lista = planesHook.planesPorDia[fechaSeleccionada] || [];
                  const nuevasFotos = [...(lista[index].fotos || []), url];
                  const nuevaLista = [...lista];
                  nuevaLista[index] = { 
                    ...nuevaLista[index], 
                    fotos: nuevasFotos 
                  };
                  
                  const success = await planesHook.guardarPlanesPorDia(fechaSeleccionada, nuevaLista);
                  
                  if (success) {
                    mostrarToast("📸 Foto guardada!");
                  } else {
                    mostrarToast("⚠️ Error al guardar foto", "error");
                  }
                }
              } catch (error) {
                console.error("Error al subir foto:", error);
                mostrarToast("❌ Error al subir foto", "error");
              }
            }}
            planes={planesHook.planes}
            setPlanes={planesHook.setPlanes}
            coupleId={coupleId}
            planesPorDia={planesHook.planesPorDia}
            notas={notasHook.notas}
            eliminarPlanEnFecha={async (indexEnDia) => {
              try {
                const lista = planesHook.planesPorDia[fechaSeleccionada] || [];
                const nuevaLista = lista.filter((_, idx) => idx !== indexEnDia);
                
                const success = await planesHook.guardarPlanesPorDia(fechaSeleccionada, nuevaLista);
                
                if (success) {
                  mostrarToast("🗑️ Plan eliminado");
                } else {
                  mostrarToast("❌ Error al eliminar", "error");
                }
              } catch (error) {
                console.error("Error al eliminar plan:", error);
                mostrarToast("❌ Error al eliminar", "error");
              }
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
            guardarNota={async (texto, categoria) => {
              const success = await notasHook.agregarNota(texto, categoria);
              if (success) {
                mostrarToast("📝 Nota guardada");
              } else {
                mostrarToast("❌ Error al guardar nota", "error");
              }
              return success;
            }}
            eliminarNota={async (notaId) => {
              const success = await notasHook.eliminarNota(notaId);
              if (success) {
                mostrarToast("🗑️ Nota eliminada");
              } else {
                mostrarToast("❌ Error al eliminar nota", "error");
              }
              return success;
            }}
            editarNota={async (notaId, texto, categoria) => {
              const success = await notasHook.editarNota(notaId, texto, categoria);
              if (success) {
                mostrarToast("✏️ Nota actualizada");
              } else {
                mostrarToast("❌ Error al editar nota", "error");
              }
              return success;
            }}
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
            desafiosDisponibles={desafiosHook.desafiosDisponibles}
          />
        );

      case 'logros':
        return (
          <LogrosScreen
            setView={setView}
            logrosHook={logrosHook}
            stats={{
              totalPlanesCompletados: planesHook.planes.filter(p => p.completado).length,
              totalFotos: stats.totalFotos,
              diasConPlanes: stats.diasConPlanes,
            }}
            razonesCount={razonesHook.razones.length}
            desafiosCount={0}
            moodCount={moodHook.historialMoods?.length || 0}
            diasJuntos={fechaAniversario 
              ? Math.floor((new Date().getTime() - new Date(fechaAniversario).getTime()) / (1000 * 60 * 60 * 24))
              : 0
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}

      {/* Botón flotante de estadísticas - SOLO EN INICIO */}
      {view === 'inicio' && (
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