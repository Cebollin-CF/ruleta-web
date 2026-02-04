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
  disabled?: boolean;
}

export default function Boton({
  text,
  onPress,
  color,
  small = false,
  style,
  textStyle,
  disabled = false,
}: BotonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <MotiView
      from={{ scale: 1 }}
      animate={{ scale: pressed && !disabled ? 0.97 : 1 }}
      transition={{ type: "timing", duration: 80 }}
      style={[
        { marginBottom: 14, opacity: disabled ? 0.6 : 1 },
        style && (style as any).flex ? { flex: (style as any).flex } : {},
        style && (style as any).width ? { width: (style as any).width } : {},
      ]}
    >
      <TouchableOpacity
        onPress={disabled ? undefined : onPress}
        onPressIn={() => !disabled && setPressed(true)}
        onPressOut={() => !disabled && setPressed(false)}
        activeOpacity={disabled ? 1 : 0.8}
        disabled={disabled}
        style={[
          {
            backgroundColor: color,
            paddingVertical: small ? 10 : 18,
            paddingHorizontal: small ? 14 : 24,
            borderRadius: 12,
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: disabled ? 0 : 0.2,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: disabled ? 0 : 3,
            width: "100%", // Asegura que el botón llene el MotiView flex
          },
          style,
        ]}
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            {
              color: "#FFFFFF",
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