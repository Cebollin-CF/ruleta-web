import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from "react-native";
import { MotiView } from "moti";
import { useState } from "react";

interface BotonProps {
  text: string;
  onPress: () => void;
  color: string;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Boton({
  text,
  onPress,
  color,
  small = false,
  style,
  textStyle,
}: BotonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: pressed ? 0.97 : 1 }}
      transition={{ type: "timing", duration: 80 }} // ✅ Más rápido (era 120)
      style={{ marginBottom: 14 }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
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