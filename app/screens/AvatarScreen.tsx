import React from "react";
import { Text, Image, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MotiView } from "moti";
import Container from "../components/Container";
import Boton from "../components/Boton";
import colors from "../utils/colors";

export default function AvatarScreen({
  setView,
  avatarUrl,
  subirAvatar,
}) {
  const seleccionarFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await subirAvatar(result.assets[0].uri);
    }
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
        💑 Foto de pareja
      </Text>

      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "timing", duration: 400 }}
        style={{
          alignItems: "center",
          marginVertical: 40,
        }}
      >
        {avatarUrl ? (
          <TouchableOpacity onPress={seleccionarFoto}>
            <Image
              source={{ uri: avatarUrl }}
              style={{
                width: 200,
                height: 200,
                borderRadius: 100,
                borderWidth: 4,
                borderColor: colors.primary,
              }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={seleccionarFoto}
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: colors.card,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 3,
              borderColor: colors.muted,
              borderStyle: "dashed",
            }}
          >
            <Text style={{ fontSize: 60 }}>📸</Text>
            <Text style={{ color: colors.muted, marginTop: 10 }}>
              Toca para subir
            </Text>
          </TouchableOpacity>
        )}
      </MotiView>

      <Boton
        text="Cambiar foto"
        color={colors.secondary}
        onPress={seleccionarFoto}
      />

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
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
          ⬅ Volver
        </Text>
      </TouchableOpacity>
    </Container>
  );
}