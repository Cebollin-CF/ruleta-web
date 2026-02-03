// app/components/Container.tsx
import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet } from "react-native";
import FloatingHeartsBackground from "./FloatingHeartsBackground";
import colors from "../utils/colors";

export default function Container({ children }) {
  return (
    <LinearGradient
      colors={[colors.bgTop, colors.bgBottom]}
      style={styles.gradient}
    >
      {/* Corazones en el fondo */}
      <FloatingHeartsBackground />
      
      {/* Contenido principal */}
      <View style={styles.content}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    position: 'relative', // ✅ Importante para posicionar corazones
  },
  content: {
    flex: 1,
    padding: 20,
    position: 'relative',
    zIndex: 1, // ✅ Asegura que el contenido esté SOBRE los corazones
  },
});