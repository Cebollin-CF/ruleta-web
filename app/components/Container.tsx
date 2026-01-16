import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import FloatingHearts from "./FloatingHearts";
import colors from "../utils/colors";

export default function Container({ children }) {
  return (
    <LinearGradient
      colors={[colors.bgTop, colors.bgBottom]}
      style={{ flex: 1 }}
    >
      <FloatingHearts />
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 350 }}
        style={{ flex: 1, padding: 20 }}
      >
        {children}
      </MotiView>
    </LinearGradient>
  );
}
