import { Text } from "react-native";
import { MotiView } from "moti";

export default function FloatingHearts() {
  return (
    <>
      {/* ✅ Solo 2 corazones en lugar de 3 - más rendimiento */}
      {[0, 1].map((i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 0.3, translateY: -20 }} // ✅ Menos opacidad
          transition={{
            loop: true,
            duration: 5000 + i * 1000, // ✅ Más lento = menos carga CPU
            delay: i * 800,
            type: "timing", // ✅ timing es más eficiente que spring
          }}
          style={{
            position: "absolute",
            top: 100 + i * 60,
            right: 40 + i * 15,
          }}
        >
          <Text style={{ fontSize: 28 + i * 6 }}>💗</Text>
        </MotiView>
      ))}
    </>
  );
}