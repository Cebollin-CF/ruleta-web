import { TouchableOpacity, Text } from "react-native";
import { MotiView } from "moti";

export default function Boton({
  text,
  onPress,
  color,
  small,
  style,
  textStyle,
}) {
  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.97 }} // ✅ Menos escala = más sutil
      transition={{ type: "timing", duration: 80 }} // ✅ Más rápido (era 120)
      style={{ marginBottom: 14 }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8} // ✅ Feedback visual táctil
        style={[
          {
            backgroundColor: color,
            paddingVertical: small ? 10 : 18,
            paddingHorizontal: small ? 14 : 24,
            borderRadius: 12,
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          },
          style,
        ]}
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            {
              color: "#FFFFFF", // ✅ Blanco puro
              fontSize: small ? 14 : 20,
              fontWeight: "700",
              textAlign: "center",
            },
            textStyle,
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    </MotiView>
  );
}