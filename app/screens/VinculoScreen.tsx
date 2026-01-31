import React from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import Container from "../components/Container";
import Boton from "../components/Boton";
import colors from "../utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  manejarScan,
}) {
  return (
    <Container>
      {/* TÍTULO */}
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

      {/* SI YA HAY VÍNCULO → botón para cambiar */}
      {coupleId && !scannerActive && (
        <Boton
          text="🔄 Cambiar vínculo"
          color={colors.secondary}
          onPress={() => {
            setCoupleId(null);
            AsyncStorage.removeItem("couple_id");
          }}
        />
      )}

      {/* SI NO HAY VÍNCULO → mostrar opciones */}
      {!coupleId && !scannerActive && (
        <>
          {/* CREAR NUEVO */}
          <Boton
            text="✨ Crear vínculo nuevo"
            color={colors.primary}
            onPress={crearPareja}
          />

          {/* ESCANEAR */}
          <Boton
            text="📷 Escanear código"
            color={colors.secondary}
            onPress={pedirPermisoCamara}
          />

          {/* CÓDIGO MANUAL */}
          <TextInput
            placeholder="Código manual"
            placeholderTextColor={colors.muted}
            value={codigoManual}
            onChangeText={setCodigoManual}
            style={{
              backgroundColor: colors.card,
              color: colors.text,
              padding: 14,
              borderRadius: 20,
              marginBottom: 10,
              marginTop: 10,
            }}
          />

          {/* BOTÓN CONECTAR */}
          <Boton
            text="Conectar"
            color={colors.primary}
            onPress={async () => {
              const code = codigoManual.trim();
              if (!code) return;

              setCoupleId(code);

              try {
                await AsyncStorage.setItem("couple_id", code);
              } catch (e) {
                console.log("Error guardando el código:", e);
              }

              setView("inicio");
            }}
          />
        </>
      )}

      {/* SI EL ESCÁNER ESTÁ ACTIVO */}
      {scannerActive && hasCameraPermission && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: colors.text, textAlign: "center", marginBottom: 10 }}>
            Escanea el código QR de tu pareja
          </Text>

          <TouchableOpacity
            onPress={() => setView("inicio")}
            style={{ marginTop: 20 }}
          >
            <Text style={{ color: colors.warning, textAlign: "center" }}>
              Cancelar escaneo
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón flotante */}
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
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
          ⬅ Volver
        </Text>
      </TouchableOpacity>
    </Container>
  );
}