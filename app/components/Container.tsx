import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import FloatingHearts from "./FloatingHearts";
import colors from "../utils/colors";

export default function Container({ children }) {
  return (
    <LinearGradient
      colors={[colors.bgTop, colors.bgBottom]}
      style={{ flex: 1 }}
    >
      <FloatingHearts />
      {/* ✅ SIN animación de entrada - mucho más rápido */}
      <View style={{ flex: 1, padding: 20 }}>
        {children}
      </View>
    </LinearGradient>
  );
}