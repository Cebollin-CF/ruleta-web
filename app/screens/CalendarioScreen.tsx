import React, { useState, useRef } from "react";
import { 
  Text, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Alert,
  Modal 
} from "react-native";
import { Calendar } from "react-native-calendars";
import Container from "../components/Container";
import colors from "../utils/colors";

export default function CalendarioScreen({
  setView,
  markedDates,
  onDayPress,
  fechaAniversario,
  setFechaAniversario,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
  const [showAniversarioPicker, setShowAniversarioPicker] = useState(false);
  const calendarRef = useRef(null);
  
  // Formatear fecha bonita
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "No establecida";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calcular días juntos CORRECTAMENTE
  const calcularDiasJuntos = () => {
    if (!fechaAniversario) return 0;
    
    try {
      const inicio = new Date(fechaAniversario);
      const hoy = new Date();
      
      // Normalizar horas
      inicio.setHours(0, 0, 0, 0);
      hoy.setHours(0, 0, 0, 0);
      
      const diferenciaMs = hoy.getTime() - inicio.getTime();
      return Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    } catch (e) {
      console.error('Error calculando días:', e);
      return 0;
    }
  };

  // Navegación entre meses - FUNCIONAL
  const cambiarMes = (direccion) => {
    const current = new Date(currentMonth);
    
    if (direccion === "prev") {
      current.setMonth(current.getMonth() - 1);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
    
    const newMonth = current.toISOString().split('T')[0];
    setCurrentMonth(newMonth);
    
    // Forzar actualización del calendario
    if (calendarRef.current) {
      // El Calendar de react-native-calendars necesita key for update
      // Simplemente cambiar el estado ya debería funcionar
    }
  };

  // Ir a mes específico
  const irAMesEspecifico = (mes, año) => {
    const nuevaFecha = new Date(año, mes - 1, 1);
    setCurrentMonth(nuevaFecha.toISOString().split('T')[0]);
  };

  // Cambiar fecha de aniversario
  const cambiarAniversario = (nuevaFecha) => {
    if (setFechaAniversario) {
      setFechaAniversario(nuevaFecha);
      setShowAniversarioPicker(false);
      
      Alert.alert(
        "¡Fecha actualizada!",
        `Vuestra fecha de inicio es ahora: ${formatearFecha(nuevaFecha)}\n\nLleváis ${calcularDiasJuntos()} días juntos 💕`,
        [{ text: "¡Genial!" }]
      );
    }
  };

  return (
    <Container>
      <Text style={styles.titulo}>
        📆 Calendario
      </Text>

      {/* Contador de días */}
      <View style={styles.contadorContainer}>
        <Text style={styles.contadorTexto}>
          {fechaAniversario 
            ? `Lleváis ${calcularDiasJuntos()} días juntos 💕`
            : "No has establecido fecha de inicio"
          }
        </Text>
        
        <TouchableOpacity
          onPress={() => setShowAniversarioPicker(true)}
          style={styles.botonEditarFecha}
        >
          <Text style={styles.botonEditarTexto}>
            {fechaAniversario ? "✏️ Cambiar fecha" : "📅 Establecer fecha"}
          </Text>
        </TouchableOpacity>
        
        {fechaAniversario && (
          <Text style={styles.fechaTexto}>
            Inicio: {formatearFecha(fechaAniversario)}
          </Text>
        )}
      </View>

      {/* Controles de navegación - SIMPLIFICADO Y FUNCIONAL */}
      <View style={styles.controlesContainer}>
        <TouchableOpacity
          onPress={() => cambiarMes("prev")}
          style={styles.botonNavegacion}
        >
          <Text style={styles.botonNavegacionTexto}>◀ Anterior</Text>
        </TouchableOpacity>

        <View style={styles.mesActualContainer}>
          <Text style={styles.mesActualTexto}>
            {new Date(currentMonth).toLocaleDateString('es-ES', { 
              month: 'long', 
              year: 'numeric' 
            }).toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => cambiarMes("next")}
          style={styles.botonNavegacion}
        >
          <Text style={styles.botonNavegacionTexto}>Siguiente ▶</Text>
        </TouchableOpacity>
      </View>

      {/* Calendario - CON key para forzar actualización */}
      <Calendar
        key={currentMonth} // ✅ FORZAR RE-RENDER AL CAMBIAR MES
        ref={calendarRef}
        current={currentMonth}
        markedDates={markedDates}
        onDayPress={onDayPress}
        monthFormat={'MMMM yyyy'}
        hideArrows={true}
        hideExtraDays={true}
        firstDay={1}
        enableSwipeMonths={true}
        onMonthChange={(month) => {
          // Actualizar cuando el usuario haga swipe
          setCurrentMonth(month.dateString);
        }}
        theme={{
          calendarBackground: 'transparent',
          textSectionTitleColor: colors.text,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: colors.accent,
          dayTextColor: colors.text,
          textDisabledColor: colors.muted,
          dotColor: colors.primary,
          selectedDotColor: '#ffffff',
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          textDayFontWeight: '500',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendario}
      />

      {/* Modal para cambiar fecha de aniversario - SIMPLE */}
      <Modal
        visible={showAniversarioPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>
              {fechaAniversario ? "📅 Cambiar fecha de inicio" : "🎉 ¿Cuándo empezasteis?"}
            </Text>
            
            <Calendar
              current={fechaAniversario || new Date().toISOString().split('T')[0]}
              onDayPress={(day) => {
                cambiarAniversario(day.dateString);
              }}
              markedDates={{
                [fechaAniversario || ""]: {
                  selected: true,
                  selectedColor: colors.loveRed,
                }
              }}
              maxDate={new Date().toISOString().split('T')[0]}
              minDate={'2000-01-01'}
              theme={{
                selectedDayBackgroundColor: colors.loveRed,
                selectedDayTextColor: '#ffffff',
                todayTextColor: colors.accent,
                arrowColor: colors.primary,
              }}
              style={styles.calendarioModal}
            />

            <TouchableOpacity
              onPress={() => setShowAniversarioPicker(false)}
              style={styles.botonCancelar}
            >
              <Text style={styles.botonCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Botón volver */}
      <TouchableOpacity
        onPress={() => setView("inicio")}
        style={styles.botonVolver}
      >
        <Text style={styles.botonVolverTexto}>⬅ Volver al inicio</Text>
      </TouchableOpacity>
    </Container>
  );
}

const styles = StyleSheet.create({
  titulo: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 15,
    textAlign: 'center',
  },
  contadorContainer: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF20',
  },
  contadorTexto: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  fechaTexto: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  botonEditarFecha: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  botonEditarTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  controlesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  botonNavegacion: {
    backgroundColor: colors.card,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  botonNavegacionTexto: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  mesActualContainer: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFB3D1',
    minWidth: 180,
    alignItems: 'center',
  },
  mesActualTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  calendario: {
    borderRadius: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 15,
  },
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContenido: {
    backgroundColor: colors.bgBottom,
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  modalTitulo: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  calendarioModal: {
    borderRadius: 16,
    marginVertical: 10,
  },
  botonCancelar: {
    backgroundColor: colors.muted,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  botonCancelarTexto: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  botonVolver: {
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
  },
  botonVolverTexto: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});