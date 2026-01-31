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
      whileTap={{ scale: 0.95 }}
      transition={{ type: "timing", duration: 120 }}
      style={{ marginBottom: 14 }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={[
          {
            backgroundColor: color,
            paddingVertical: small ? 10 : 18,
            paddingHorizontal: small ? 14 : 24,
            borderRadius: 12, // más cuadrado
            alignItems: "center",
            shadowColor: color,
            shadowOpacity: 0.35,
            shadowRadius: 14,
            elevation: 5,
          },
          style,
        ]}
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            {
              color: "#fff",
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