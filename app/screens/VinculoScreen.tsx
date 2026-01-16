import React from "react";
import { Text, View, TextInput } from "react-native";
import Container from "../components/Container";
import Boton from "../components/Boton";
import colors from "../utils/colors";

export default function VinculoScreen({
  setView,
  coupleId,
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

      {!coupleId && !scannerActive && (
        <>
          <Boton text="✨ Crear vínculo nuevo" color={colors.primary} onPress={crearPareja} />
          <Boton text="📷 Escanear código" color={colors.secondary} onPress={pedirPermisoCamara} />

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
            }}
          />

          <Boton
            text="Conectar"
            color={colors.primary}
            onPress={() => {
              if (!codigoManual.trim()) return;
              setView("inicio");
            }}
          />
        </>
      )}

      <Boton text="⬅ Volver" color={colors.warning} onPress={() => setView("inicio")} />
    </Container>
  );
}
