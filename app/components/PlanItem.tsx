import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import colors from "../utils/colors";
import Boton from "./Boton";

export default function PlanItem({ plan, onUse, onEdit, onDelete }) {
  return (
    <View
      style={{
        backgroundColor: colors.card,
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        position: "relative",
        borderWidth: 2,
        borderColor: "#FFFFFF20",
      }}
    >
      {/* Título del plan */}
      <Text
        style={{
          color: "#FFFFFF", // ✅ Blanco puro (era colors.text)
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 10,
        }}
      >
        {plan.titulo}
      </Text>

      {/* Botones Usar + Editar */}
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Boton
            text="Usar"
            color={colors.primary}
            small
            onPress={onUse}
          />
        </View>

        <View style={{ flex: 1, marginLeft: 6 }}>
          <Boton
            text="Editar"
            color={colors.secondary}
            small
            onPress={onEdit}
          />
        </View>
      </View>

      {/* Botón borrar redondo */}
      <TouchableOpacity
        onPress={onDelete}
        activeOpacity={0.7}
        style={{
          position: "absolute",
          right: 12,
          top: 12,
          backgroundColor: colors.danger,
          width: 42,
          height: 42,
          borderRadius: 21,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 20 }}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
}