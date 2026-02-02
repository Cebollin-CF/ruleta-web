import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  StyleSheet,
  Animated,
  Easing
} from 'react-native';
import Container from '../components/Container';
import Boton from '../components/Boton';
import colors from '../utils/colors';
import { ACCESORIOS_TIENDA } from '../utils/accesorios';

// Al inicio del archivo, actualiza los tipos de props:
export default function MascotaScreen({ 
  setView, 
  mascotaHook,
  puntosTotales,
  mostrarToast // ✅ Añade esta prop
}) {
  
  const [mostrarTienda, setMostrarTienda] = useState(false);
  const [mostrarRecompensa, setMostrarRecompensa] = useState(false);
  
  // Animaciones
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-300)).current;
  
  // Animal según especie
  const getAnimalEmoji = () => {
    switch(mascotaHook.mascota.especie) {
      case 'gatito': return '🐱';
      case 'gato adolescente': return '🐈';
      case 'gato adulto': return '🐈‍⬛';
      case 'gato legendario': return '🦁';
      default: return '🐾';
    }
  };

  // Estado emoji
  const getEstadoEmoji = () => {
    switch(mascotaHook.mascota.estado) {
      case 'feliz': return '😊';
      case 'hambriento': return '🍕';
      case 'cansado': return '😴';
      case 'jugueton': return '🎾';
      case 'satisfecho': return '😌';
      default: return '😐';
    }
  };

  // Animación de interacción
  const animarInteraccion = (tipo) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      })
    ]).start();
  };

  // Animación tienda
  const toggleTienda = () => {
    if (mostrarTienda) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMostrarTienda(false));
    } else {
      setMostrarTienda(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }).start();
    }
  };

  // Manejar interacción
  const handleInteractuar = async (tipo) => {
    const tiempoRestante = mascotaHook.getTiempoRestante(tipo);
    
    if (tiempoRestante > 0) {
      mostrarToast(`⏰ Espera ${tiempoRestante}h para ${tipo}`, 'warning');
      return;
    }
    
    animarInteraccion(tipo);
    const resultado = await mascotaHook.interactuar(tipo);
    
    if (resultado.success) {
      mostrarToast(resultado.mensaje);
      
      if (resultado.recompensa) {
        setMostrarRecompensa(true);
        mostrarToast(resultado.mensajeExtra, 'success');
        
        // Resetear felicidad después de 3 segundos
        setTimeout(async () => {
          await mascotaHook.resetearFelicidad();
          setMostrarRecompensa(false);
        }, 5000);
      }
    } else {
      mostrarToast(resultado.error, 'error');
    }
  };

  // Manejar compra
  const handleComprar = async (accesorio) => {
    const resultado = await mascotaHook.comprarAccesorio(accesorio);
    
    if (resultado.success) {
      mostrarToast(resultado.mensaje, 'success');
    } else {
      mostrarToast(resultado.error, 'error');
    }
  };

  // Última recompensa
  const ultimaRecompensa = mascotaHook.mascota.recompensasDesbloqueadas?.slice(-1)[0];

  return (
    <Container>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Botón volver */}
        <TouchableOpacity 
          onPress={() => setView("inicio")}
          style={styles.botonVolver}
        >
          <Text style={styles.botonVolverTexto}>⬅ Volver</Text>
        </TouchableOpacity>
        
        {/* Título */}
        <Text style={styles.titulo}>
          {getAnimalEmoji()} {mascotaHook.mascota.nombre}
        </Text>
        
        {/* ANIMAL ANIMADO */}
        <View style={styles.contenedorAnimal}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Text style={styles.animalEmoji}>
              {getAnimalEmoji()}
            </Text>
            
            {/* Accesorios equipados */}
            {mascotaHook.mascota.accesorios
              .filter(acc => acc.equipado)
              .map((acc, index) => (
                <Text 
                  key={acc.id}
                  style={[
                    styles.accesorioEmoji,
                    { 
                      position: 'absolute',
                      top: acc.posicion?.top || 0,
                      left: acc.posicion?.left || 0,
                      zIndex: index + 1
                    }
                  ]}
                >
                  {acc.emoji}
                </Text>
              ))}
          </Animated.View>
          
          {/* Estado */}
          <Text style={styles.estadoTexto}>
            {getEstadoEmoji()} {mascotaHook.mascota.estado}
          </Text>
        </View>
        
        {/* INFORMACIÓN */}
        <View style={styles.infoContainer}>
          <Text style={styles.nivelTexto}>
            Nivel {mascotaHook.mascota.nivel} • {mascotaHook.mascota.especie}
          </Text>
          
          {/* Barra de experiencia */}
          <View style={styles.barraContainer}>
            <Text style={styles.barraLabel}>Experiencia</Text>
            <View style={styles.barraFondo}>
              <View 
                style={[
                  styles.barraProgreso, 
                  { width: `${(mascotaHook.mascota.experiencia / mascotaHook.mascota.experienciaNecesaria) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.barraTexto}>
              {mascotaHook.mascota.experiencia}/{mascotaHook.mascota.experienciaNecesaria} EXP
            </Text>
          </View>
          
          {/* Barra de felicidad */}
          <View style={styles.barraContainer}>
            <Text style={styles.barraLabel}>Felicidad</Text>
            <View style={styles.barraFondo}>
              <View 
                style={[
                  styles.barraProgresoFelicidad, 
                  { width: `${mascotaHook.mascota.felicidad}%` }
                ]}
              />
            </View>
            <Text style={styles.barraTexto}>
              {mascotaHook.mascota.felicidad}/100
            </Text>
            {mascotaHook.mascota.felicidad === 100 && (
              <Text style={styles.felicidadCompleta}>🎉 ¡Felicidad al máximo!</Text>
            )}
          </View>
          
          <Text style={styles.puntosTexto}>
            Puntos disponibles: {puntosTotales}
          </Text>
        </View>
        
        {/* INTERACCIONES */}
        <View style={styles.interaccionesContainer}>
          <Text style={styles.subtitulo}>💝 Interacciones</Text>
          <View style={styles.botonesInteraccion}>
            {['acariciar', 'alimentar', 'jugar'].map((tipo) => {
              const tiempoRestante = mascotaHook.getTiempoRestante(tipo);
              const puede = tiempoRestante === 0;
              
              return (
                <TouchableOpacity
                  key={tipo}
                  onPress={() => handleInteractuar(tipo)}
                  style={[
                    styles.botonInteraccion,
                    !puede && styles.botonInteraccionDisabled
                  ]}
                  disabled={!puede}
                >
                  <Text style={styles.botonInteraccionEmoji}>
                    {tipo === 'acariciar' ? '✋' : 
                     tipo === 'alimentar' ? '🍎' : '🎾'}
                  </Text>
                  <Text style={styles.botonInteraccionTexto}>
                    {tipo === 'acariciar' ? 'Acariciar' : 
                     tipo === 'alimentar' ? 'Alimentar' : 'Jugar'}
                  </Text>
                  {!puede && (
                    <Text style={styles.tiempoTexto}>
                      ⏰ {tiempoRestante}h
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        
        {/* ACCESORIOS EQUIPADOS */}
        {mascotaHook.mascota.accesorios.filter(acc => acc.equipado).length > 0 && (
          <View style={styles.accesoriosContainer}>
            <Text style={styles.subtitulo}>🎀 Accesorios equipados</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mascotaHook.mascota.accesorios
                .filter(acc => acc.equipado)
                .map(acc => (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => mascotaHook.toggleAccesorio(acc.id, false)}
                    style={styles.accesorioItem}
                  >
                    <Text style={styles.accesorioItemEmoji}>{acc.emoji}</Text>
                    <Text style={styles.accesorioItemNombre}>{acc.nombre}</Text>
                    <Text style={styles.accesorioItemEfecto}>{acc.efecto}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}
        
        {/* BOTÓN TIENDA */}
        <TouchableOpacity
          onPress={toggleTienda}
          style={styles.botonTienda}
        >
          <Text style={styles.botonTiendaTexto}>
            🛍️ Abrir tienda
          </Text>
        </TouchableOpacity>
        
        {/* Espacio para que la tienda modal no tape contenido */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* MODAL TIENDA (se desliza desde arriba) */}
      <Modal
        visible={mostrarTienda}
        transparent={true}
        animationType="none"
        onRequestClose={toggleTienda}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleTienda}
        >
          <Animated.View 
            style={[
              styles.tiendaModal,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.tiendaHeader}>
              <Text style={styles.tiendaTitulo}>🛒 Tienda de Alorix</Text>
              <TouchableOpacity onPress={toggleTienda}>
                <Text style={styles.tiendaCerrar}>❌</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.tiendaLista}
              showsVerticalScrollIndicator={true}
            >
              {ACCESORIOS_TIENDA.map(item => {
                const yaComprado = mascotaHook.mascota.accesorios.some(a => a.id === item.id);
                const equipado = yaComprado && mascotaHook.mascota.accesorios.find(a => a.id === item.id)?.equipado;
                const puedeComprar = puntosTotales >= item.precio || item.exclusivo;
                
                return (
                  <View 
                    key={item.id} 
                    style={[
                      styles.itemTienda,
                      yaComprado && styles.itemComprado,
                      (!puedeComprar && !yaComprado) && styles.itemNoDisponible
                    ]}
                  >
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                    
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemNombre}>
                        {item.nombre}
                        {item.exclusivo && ' 🔒'}
                      </Text>
                      <Text style={styles.itemEfecto}>{item.efecto}</Text>
                      <Text style={styles.itemPrecio}>
                        {item.precio === 0 ? 'Gratis' : `${item.precio} puntos`}
                      </Text>
                    </View>
                    
                    <View style={styles.itemAcciones}>
                      {yaComprado ? (
                        <TouchableOpacity
                          onPress={() => mascotaHook.toggleAccesorio(item.id, !equipado)}
                          style={[
                            styles.botonAccion,
                            equipado ? styles.botonDesequipar : styles.botonEquipar
                          ]}
                        >
                          <Text style={styles.botonAccionTexto}>
                            {equipado ? '❌ Quitar' : '✅ Equipar'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleComprar(item)}
                          style={[
                            styles.botonAccion,
                            (!puedeComprar || item.exclusivo) && styles.botonNoDisponible
                          ]}
                          disabled={!puedeComprar || item.exclusivo}
                        >
                          <Text style={styles.botonAccionTexto}>
                            {item.exclusivo ? 'Exclusivo' : 'Comprar'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      
      {/* MODAL RECOMPENSA */}
      <Modal
        visible={mostrarRecompensa}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.recompensaOverlay}>
          <View style={styles.recompensaModal}>
            <Text style={styles.recompensaTitulo}>🎊 ¡RECOMPENSA DESBLOQUEADA!</Text>
            
            {ultimaRecompensa && (
              <>
                <Text style={styles.recompensaMensaje}>
                  {ultimaRecompensa.titulo}
                </Text>
                <Text style={styles.recompensaDescripcion}>
                  {ultimaRecompensa.recompensa}
                </Text>
                <Text style={styles.recompensaDetalle}>
                  {ultimaRecompensa.descripcion}
                </Text>
                
                {/* Accesorio exclusivo automático */}
                {ultimaRecompensa.tipo === 'felicidad_completa' && (
                  <View style={styles.recompensaAccesorio}>
                    <Text style={styles.recompensaAccesorioEmoji}>💎</Text>
                    <Text style={styles.recompensaAccesorioTexto}>
                      ¡Has obtenido el Collar de Diamantes!
                    </Text>
                  </View>
                )}
              </>
            )}
            
            <TouchableOpacity
              onPress={() => setMostrarRecompensa(false)}
              style={styles.botonCerrarRecompensa}
            >
              <Text style={styles.botonCerrarRecompensaTexto}>¡Genial! 🎉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  titulo: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  contenedorAnimal: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: colors.card,
    padding: 30,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFFFFF30',
    position: 'relative',
  },
  animalEmoji: {
    fontSize: 100,
  },
  accesorioEmoji: {
    fontSize: 30,
  },
  estadoTexto: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  infoContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF20',
  },
  nivelTexto: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  barraContainer: {
    marginBottom: 15,
  },
  barraLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  barraFondo: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barraProgreso: {
    backgroundColor: colors.primary,
    height: '100%',
    borderRadius: 5,
  },
  barraProgresoFelicidad: {
    backgroundColor: '#FFD93D',
    height: '100%',
    borderRadius: 5,
  },
  barraTexto: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  felicidadCompleta: {
    color: '#FFD93D',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
    textAlign: 'center',
  },
  puntosTexto: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  interaccionesContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  subtitulo: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  botonesInteraccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonInteraccion: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  botonInteraccionDisabled: {
    backgroundColor: colors.muted,
    opacity: 0.7,
  },
  botonInteraccionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  botonInteraccionTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  tiempoTexto: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 5,
    fontWeight: '700',
  },
  accesoriosContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  accesorioItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    marginRight: 10,
    minWidth: 120,
  },
  accesorioItemEmoji: {
    fontSize: 30,
    marginBottom: 5,
  },
  accesorioItemNombre: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
    textAlign: 'center',
  },
  accesorioItemEfecto: {
    color: colors.muted,
    fontSize: 10,
    textAlign: 'center',
  },
  botonTienda: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  botonTiendaTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  tiendaModal: {
    backgroundColor: colors.bgBottom,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingTop: 40,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  tiendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF20',
  },
  tiendaTitulo: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '800',
  },
  tiendaCerrar: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  tiendaLista: {
    paddingHorizontal: 20,
    paddingTop: 15,
    maxHeight: 400,
  },
  itemTienda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF10',
  },
  itemComprado: {
    backgroundColor: 'rgba(107, 209, 138, 0.1)',
    borderColor: '#6BD18A30',
  },
  itemNoDisponible: {
    opacity: 0.6,
  },
  itemEmoji: {
    fontSize: 35,
    marginRight: 15,
  },
  itemInfo: {
    flex: 1,
  },
  itemNombre: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 3,
  },
  itemEfecto: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 5,
  },
  itemPrecio: {
    color: colors.warning,
    fontSize: 14,
    fontWeight: '700',
  },
  itemAcciones: {
    marginLeft: 10,
  },
  botonAccion: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  botonEquipar: {
    backgroundColor: colors.success,
  },
  botonDesequipar: {
    backgroundColor: colors.danger,
  },
  botonNoDisponible: {
    backgroundColor: colors.muted,
  },
  botonAccionTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  recompensaOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  recompensaModal: {
    backgroundColor: colors.card,
    borderRadius: 30,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.warning,
  },
  recompensaTitulo: {
    color: colors.warning,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  recompensaMensaje: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  recompensaDescripcion: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  recompensaDetalle: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  recompensaAccesorio: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    width: '100%',
  },
  recompensaAccesorioEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  recompensaAccesorioTexto: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  botonCerrarRecompensa: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  botonCerrarRecompensaTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  botonVolver: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: colors.warning,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 100,
  },
  botonVolverTexto: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});