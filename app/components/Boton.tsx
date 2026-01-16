import { TouchableOpacity, Text } from "react-native";
import { MotiView } from "moti";

export default function Boton({ text, onPress, color, small }) {
  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "timing", duration: 120 }}
      style={{ marginBottom: 14 }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: color,
          paddingVertical: small ? 10 : 18,
          paddingHorizontal: small ? 14 : 24,
          borderRadius: 20,
          alignItems: "center",
          shadowColor: color,
          shadowOpacity: 0.35,
          shadowRadius: 14,
          elevation: 5,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: small ? 14 : 20,
            fontWeight: "700",
          }}
        >
          {text}
        </Text>
      </TouchableOpacity>
    </MotiView>
  );
}
