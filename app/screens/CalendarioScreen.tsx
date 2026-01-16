import React from "react";
import { Text } from "react-native";
import Container from "../components/Container";
import Boton from "../components/Boton";
import colors from "../utils/colors";
import { Calendar } from "react-native-calendars";

export default function CalendarioScreen({
  setView,
  markedDates,
  onDayPress,
}) {
  return (
    <Container>
      <Text
        style={{
          color: colors.accent,
          fontSize: 32,
          fontWeight: "800",
          marginBottom: 20,
        }}
      >
        📆 Elige un día
      </Text>

      <Calendar markedDates={markedDates} onDayPress={onDayPress} />

      <Boton text="⬅ Volver" color={colors.warning} onPress={() => setView("inicio")} />
    </Container>
  );
}
