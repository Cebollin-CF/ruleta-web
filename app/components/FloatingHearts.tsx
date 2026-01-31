import { Text } from "react-native";
import { MotiView } from "moti";

export default function FloatingHearts() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 0.4, translateY: -20 }}
          transition={{
            loop: true,
            duration: 4000 + i * 600,
            delay: i * 500,
          }}
          style={{
            position: "absolute",
            top: 80 + i * 40,
            right: 30 + i * 10,
          }}
        >
          <Text style={{ fontSize: 32 + i * 4 }}>💗</Text>
        </MotiView>
      ))}
    </>
  );
}