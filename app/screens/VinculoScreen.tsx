import React from "react";
import { Text, View, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { CameraView } from "expo-camera";
import Container from "../components/Container";
import Boton from "../components/Boton";
import colors from "../utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface VinculoScreenProps {
  setView: (view: string) => void;
  coupleId: string | null;
  setCoupleId: (id: string | null) => void;
  scannerActive: boolean;
  hasCameraPermission: boolean | null;
  codigoManual: string;
  setCodigoManual: (code: string) => void;
  pedirPermisoCamara: () => void;
  crearPareja: () => void;
  conectarPareja: (code: string) => Promise<{ success: boolean; message?: string } | undefined>;
  manejarScan: (result: { data: string }) => void;
  mostrarToast: (mensaje: string, tipo?: 'success' | 'error' | 'warning' | 'info', emoji?: string) => void;
}

export default function VinculoScreen({
  setView,
  coupleId,
  setCoupleId,
  scannerActive,
  hasCameraPermission,
  codigoManual,
  setCodigoManual,
  pedirPermisoCamara,
  crearPareja,
  conectarPareja,
  manejarScan,
  // mostrarToast, // Not used in this screen but passed
}: VinculoScreenProps) {

  const handleConectarManual = async () => {
    const code = codigoManual.trim().toUpperCase();
    if (!code) {
      Alert.alert("Error", "Por favor, introduce un código.");
      return;
    }

    // Usamos la función del hook
    const resultado = await conectarPareja(code);

    if (resultado?.success) {
      // Si tuvo éxito, conectarPareja ya habrá hecho el setView("inicio")
      setCodigoManual(""); // Limpiamos el input
    }
    // Si no tuvo éxito, conectarPareja ya habrá mostrado una alerta
  };

  return (
    <Container>
      <Text
        style={{
          color: colors.accent,
          fontSize: 32,
          fontWeight: "800",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        💕 Conectar pareja
      </Text>

      {/* SI YA HAY VÍNCULO */}
      {coupleId && !scannerActive && (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.text, marginBottom: 15 }}>
            Código actual: <Text style={{ fontWeight: 'bold' }}>{coupleId}</Text>
          </Text>
          <Boton
            text="🔄 Cambiar / Cerrar Sesión"
            color={colors.secondary}
            onPress={() => {
              setCoupleId(null);
              AsyncStorage.removeItem("couple_id");
            }}
          />
        </View>
      )}

      {/* OPCIONES DE VÍNCULO */}
      {!coupleId && !scannerActive && (
        <>
          <Boton
            text="✨ Crear vínculo nuevo"
            color={colors.primary}
            onPress={crearPareja}
          />

          <View style={{ marginVertical: 20, alignItems: 'center' }}>
            <Text style={{ color: colors.muted }}>─── O CONECTA UNO EXISTENTE ───</Text>
          </View>

          <Boton
            text="📷 Escanear código QR"
            color={colors.secondary}
            onPress={pedirPermisoCamara}
          />

          <TextInput
            placeholder="Introduce el código de tu pareja"
            placeholderTextColor={colors.muted}
            value={codigoManual}
            onChangeText={setCodigoManual}
            autoCapitalize="characters" // Ayuda al usuario a escribir en mayúsculas
            style={{
              backgroundColor: colors.card,
              color: colors.text,
              padding: 14,
              borderRadius: 20,
              marginBottom: 10,
              marginTop: 20,
              textAlign: 'center',
              fontSize: 18,
              fontWeight: 'bold',
              borderWidth: 1,
              borderColor: colors.primary
            }}
          />

          <Boton
            text="Conectar"
            color={colors.primary}
            onPress={handleConectarManual} // <--- Nueva lógica segura
          />
        </>
      )}

      {/* ESTADO DE ESCÁNER */}
      {scannerActive && hasCameraPermission && (
        <View style={{ marginTop: 20, flex: 1, width: '100%', height: 400, overflow: 'hidden', borderRadius: 20 }}>
          <Text style={{ color: colors.text, textAlign: "center", marginBottom: 10 }}>
            Apunta al código de tu pareja
          </Text>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={manejarScan}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
          <TouchableOpacity
            onPress={() => setView("inicio")}
            style={{
              position: 'absolute',
              bottom: 20,
              alignSelf: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
              padding: 10,
              borderRadius: 10
            }}
          >
            <Text style={{ color: colors.warning, textAlign: "center" }}>
              Cancelar escaneo
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* BOTÓN VOLVER (Solo mostrar si no estamos escaneando para evitar superposición) */}
      {!scannerActive && (
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
            elevation: 6,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            ⬅ Volver
          </Text>
        </TouchableOpacity>
      )}
    </Container>
  );
}