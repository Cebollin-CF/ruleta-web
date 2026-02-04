import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from "react-native";
import Container from "../components/Container";
import Boton from "../components/Boton";
import { useTheme } from "../context/ThemeContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  FadeIn,
  withDelay,
  withRepeat,
  withSequence,
  useAnimatedProps,
} from "react-native-reanimated";
import Svg, { Path, G, Circle, Defs, RadialGradient, Stop, Text as SvgText } from "react-native-svg";
import * as Haptics from "expo-haptics";

const { width, height: screenHeight } = Dimensions.get("window");
const WHEEL_SIZE = 250;
const RADIUS = WHEEL_SIZE / 2;

import { Plan } from "../utils/types";

interface RuletaScreenProps {
  setView: (view: string) => void;
  planes: Plan[];
  planActual: Plan | null;
  girar: () => boolean;
  intentosRuleta: number;
}

const ConfettiPiece = ({ index }: { index: number }) => {
  const x = useSharedValue(Math.random() * width);
  const y = useSharedValue(-20);
  const rotate = useSharedValue(0);
  const color = ["#FF4F8B", "#B28DFF", "#6BD18A", "#F7C56D", "#6BE6FF"][index % 5];

  useEffect(() => {
    y.value = withDelay(index * 50, withTiming(screenHeight + 20, {
      duration: 2000 + Math.random() * 2000,
      easing: Easing.linear
    }));
    rotate.value = withDelay(index * 50, withTiming(720, { duration: 3000 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: color,
    borderRadius: index % 2 === 0 ? 4 : 0,
    transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: `${rotate.value}deg` }],
    zIndex: 2000,
  }));

  return <Animated.View style={style} />;
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function RuletaScreen({
  setView,
  planes = [],
  planActual,
  girar,
  intentosRuleta,
}: RuletaScreenProps) {
  const { theme } = useTheme();
  const { colors } = theme;

  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1); // ✅ Efecto pulso para ganador
  const [spinning, setSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(-1);
  const [confetti, setConfetti] = useState<number[]>([]);

  const hasPlanes = planes && planes.length > 0;
  const numSegments = hasPlanes ? planes.length : 8;
  const realAngle = 360 / numSegments;

  // Animación de pulso cuando hay ganador
  useEffect(() => {
    if (showResult) {
      pulse.value = 1;
      pulse.value = withRepeat(withTiming(1.3, { duration: 600 }), -1, true);
    } else {
      pulse.value = 1;
    }
  }, [showResult]);

  const winningCircleProps = useAnimatedProps(() => {
    return {
      r: 10 * pulse.value,
      opacity: showResult ? 0.8 : 0,
    };
  });

  // ✅ LÓGICA DE TICKING (Haptics al pasar segmentos)
  const lastTickIndex = useSharedValue(-1);

  useAnimatedStyle(() => {
    const currentAngle = rotation.value % 360;
    const currentSegmentIndex = Math.floor((360 - currentAngle) / realAngle) % numSegments;

    if (currentSegmentIndex !== lastTickIndex.value && spinning) {
      lastTickIndex.value = currentSegmentIndex;
      runOnJS(Haptics.selectionAsync)();
    }
    return {};
  });

  useEffect(() => {
    if (planActual && spinning) {
      const index = planes.findIndex(p => p.id === planActual.id);
      if (index !== -1) {
        setWinnerIndex(index);
        startAnimation(index);
      } else {
        // Si no se encuentra el plan por alguna razón, resetear
        setSpinning(false);
      }
    }
  }, [planActual, spinning]);

  // ✅ MOTOR DE FÍSICA V3
  const startAnimation = (targetIndex: number) => {
    const extraRotations = 8 + Math.floor(Math.random() * 4);
    const targetAngle = (extraRotations * 360) + (360 - (targetIndex * realAngle + realAngle / 2));

    rotation.value = 0;
    rotation.value = withTiming(targetAngle, {
      duration: 5500,
      easing: Easing.bezier(0.2, 0, 0, 1),
    }, (finished) => {
      if (finished) {
        runOnJS(onFinished)();
      }
    });
  };

  const onFinished = () => {
    setSpinning(false);
    setShowResult(true);
    setConfetti(Array.from({ length: 50 }, (_, i) => i));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setConfetti([]), 5000);
  };

  const handleSpin = () => {
    if (!hasPlanes) {
      setView("nuevo");
      return;
    }
    if (spinning) return;
    setSpinning(true);
    setShowResult(false);
    setConfetti([]);
    lastTickIndex.value = -1;
    const success = girar();
    if (success === false) {
      setSpinning(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const segmentColors = [
    "#FF4F8B", "#B28DFF", "#6BD18A", "#F7C56D",
    "#FF6B6B", "#6BE6FF", "#FFB3D1", "#D4A5FF"
  ];

  const getIconForPlan = (titulo: string) => {
    const t = titulo.toLowerCase();
    if (t.includes("cena") || t.includes("comer") || t.includes("restaurante")) return "🍴";
    if (t.includes("cine") || t.includes("película") || t.includes("netflix")) return "🍿";
    if (t.includes("paseo") || t.includes("parque") || t.includes("aire libre")) return "🌳";
    if (t.includes("viaje") || t.includes("escapada") || t.includes("hotel")) return "✈️";
    if (t.includes("juego") || t.includes("play") || t.includes("consola")) return "🎮";
    if (t.includes("masaje") || t.includes("spa") || t.includes("relax")) return "💆";
    return "✨";
  };

  const renderSegments = () => {
    const segments = [];
    for (let i = 0; i < numSegments; i++) {
      const startAngle = i * realAngle;
      const endAngle = (i + 1) * realAngle;

      const x1 = RADIUS + RADIUS * Math.cos((Math.PI * startAngle) / 180);
      const y1 = RADIUS + RADIUS * Math.sin((Math.PI * startAngle) / 180);
      const x2 = RADIUS + RADIUS * Math.cos((Math.PI * endAngle) / 180);
      const y2 = RADIUS + RADIUS * Math.sin((Math.PI * endAngle) / 180);

      const largeArcFlag = realAngle > 180 ? 1 : 0;
      const pathData = `M${RADIUS},${RADIUS} L${x1},${y1} A${RADIUS},${RADIUS} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;

      const segmentColor = hasPlanes ? segmentColors[i % segmentColors.length] : (i % 2 === 0 ? colors.card : colors.bgTop);
      const isWinner = showResult && i === winnerIndex;

      segments.push(
        <G key={i}>
          <Path
            d={pathData}
            fill={segmentColor}
            stroke={isWinner ? "white" : colors.bgTop}
            strokeWidth={isWinner ? "3" : "1"}
          />

          <Path
            d={pathData}
            fill="url(#segmentHighlight)"
            opacity={0.3}
            pointerEvents="none"
          />

          {hasPlanes && (
            <G transform={`rotate(${startAngle + realAngle / 2}, ${RADIUS}, ${RADIUS})`}>
              <SvgText
                x={RADIUS + RADIUS * 0.75}
                y={RADIUS + 5}
                fontSize="14"
                textAnchor="middle"
                transform={`rotate(${90}, ${RADIUS + RADIUS * 0.75}, ${RADIUS})`}
              >
                {getIconForPlan(planes[i].titulo)}
              </SvgText>
            </G>
          )}

          {isWinner && (
            <AnimatedCircle
              cx={RADIUS + RADIUS * 0.85 * Math.cos((Math.PI * (startAngle + realAngle / 2)) / 180)}
              cy={RADIUS + RADIUS * 0.85 * Math.sin((Math.PI * (startAngle + realAngle / 2)) / 180)}
              fill="white"
              animatedProps={winningCircleProps}
            />
          )}
        </G>
      );
    }
    return segments;
  };

  return (
    <Container>
      {confetti.map((i) => <ConfettiPiece key={i} index={i} />)}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.accent }]}>Mega Ruleta V3 🎡</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            {!hasPlanes ? "¡Añade planes para empezar!" : (spinning ? "¡Mucha suerte! 🍀" : "Gira para elegir tu destino")}
          </Text>
        </View>

        <View style={styles.wheelMainContainer}>
          <View style={styles.pointerContainer}>
            <Svg width="40" height="40" viewBox="0 0 30 30">
              <Path d="M15 28 L3 5 L27 5 Z" fill={colors.primary} stroke="white" strokeWidth="2" />
              <Circle cx="15" cy="8" r="3" fill="white" />
            </Svg>
          </View>

          <View style={styles.wheelShadow}>
            <Animated.View style={[styles.wheelWrapper, animatedStyle]}>
              <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
                <Defs>
                  <RadialGradient id="grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <Stop offset="0%" stopColor="#fff" stopOpacity="0.2" />
                    <Stop offset="85%" stopColor="#000" stopOpacity="0.1" />
                    <Stop offset="100%" stopColor="#000" stopOpacity="0.4" />
                  </RadialGradient>

                  <RadialGradient id="innerShadow" cx="50%" cy="50%" r="50%">
                    <Stop offset="80%" stopColor="#000" stopOpacity="0" />
                    <Stop offset="100%" stopColor="#000" stopOpacity="0.3" />
                  </RadialGradient>

                  <RadialGradient id="segmentHighlight" cx="50%" cy="50%" r="50%">
                    <Stop offset="70%" stopColor="white" stopOpacity="0" />
                    <Stop offset="100%" stopColor="white" stopOpacity="0.4" />
                  </RadialGradient>
                </Defs>

                <G transform={`rotate(-90, ${RADIUS}, ${RADIUS})`}>
                  {renderSegments()}
                </G>

                <Circle cx={RADIUS} cy={RADIUS} r={RADIUS} fill="url(#grad)" pointerEvents="none" />
                <Circle cx={RADIUS} cy={RADIUS} r={RADIUS} fill="url(#innerShadow)" pointerEvents="none" />

                <Circle cx={RADIUS} cy={RADIUS} r={18} fill={colors.card} stroke={colors.primary} strokeWidth="3" />
                <Circle cx={RADIUS} cy={RADIUS} r={14} fill={colors.primary} opacity={0.2} />
                <SvgText
                  x={RADIUS}
                  y={RADIUS + 5}
                  fontSize="12"
                  textAnchor="middle"
                  fill={colors.primary}
                  fontWeight="bold"
                >
                  🚀
                </SvgText>
              </Svg>
            </Animated.View>
          </View>
        </View>

        <View style={styles.actionArea}>
          {!showResult ? (
            <View style={{ alignItems: "center" }}>
              <Boton
                text={spinning ? "Girando..." : (hasPlanes ? "¡GIRAR! 🎲" : "CREAR PLANES ✨")}
                color={!hasPlanes ? colors.secondary : (spinning ? colors.muted : colors.primary)}
                onPress={handleSpin}
                disabled={spinning}
                style={{ width: width * 0.55, height: 60 }}
              />
              {hasPlanes && (
                <Text style={[styles.mutedText, { color: colors.muted }]}>
                  {planes.length} opciones listas
                </Text>
              )}
            </View>
          ) : (
            <Animated.View
              entering={FadeIn.delay(200).springify().damping(12)}
              style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.primary }]}
            >
              <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <Circle cx="10%" cy="10%" r="2" fill={colors.primary} opacity="0.3" />
                <Circle cx="90%" cy="20%" r="3" fill={colors.secondary} opacity="0.4" />
                <Circle cx="15%" cy="80%" r="4" fill={colors.accent} opacity="0.3" />
                <Circle cx="85%" cy="90%" r="2" fill={colors.success} opacity="0.4" />
              </Svg>

              <Text style={styles.resultEmoji}>✨ 🎯 ✨</Text>
              <Text style={[styles.resultTitle, { color: colors.primary }]}>
                {planActual?.titulo}
              </Text>

              <View style={styles.resultDetails}>
                {planActual?.precio && (
                  <View style={[styles.detailBadge, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={{ color: colors.primary, fontWeight: '700' }}>💰 {planActual.precio}€</Text>
                  </View>
                )}
                {planActual?.duracion && (
                  <View style={[styles.detailBadge, { backgroundColor: colors.secondary + '15' }]}>
                    <Text style={{ color: colors.secondary, fontWeight: '700' }}>⏱️ {planActual.duracion}min</Text>
                  </View>
                )}
              </View>

              <View style={styles.resultButtons}>
                <Boton
                  text="MOLA ❤️"
                  color={colors.success}
                  onPress={() => setView("calendario")}
                  style={{ flex: 1, height: 50, marginBottom: 0 }}
                />
                {intentosRuleta < 3 && (
                  <Boton
                    text={`OTRO (${3 - intentosRuleta})`}
                    color={colors.secondary}
                    onPress={handleSpin}
                    style={{ flex: 1, height: 55, marginBottom: 0 }}
                  />
                )}
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => setView("inicio")}
        style={[styles.backButton, { backgroundColor: colors.warning }]}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Text style={styles.backButtonText}>⬅ Volver</Text>
      </TouchableOpacity>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
    textAlign: 'center',
  },
  wheelMainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  pointerContainer: {
    position: 'absolute',
    top: -25,
    zIndex: 100,
    alignItems: 'center',
    width: '100%',
  },
  wheelShadow: {
    borderRadius: RADIUS,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  actionArea: {
    marginTop: 35,
    minHeight: 180,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  mutedText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
    opacity: 0.7,
  },
  resultCard: {
    padding: 20,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  resultEmoji: {
    fontSize: 32,
    marginBottom: 5
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10
  },
  resultDetails: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
    marginTop: 5,
  },
  detailBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%'
  },
  backButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700"
  }
});