import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch, Alert, ScrollView } from "react-native";
import { useTheme } from "../context/ThemeContext";
import Container from "../components/Container";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../supabaseClient";

import { Usuario } from "../utils/types";

interface AjustesScreenProps {
    setView: (view: string) => void;
    coupleId: string | null;
    setCoupleId: (id: string | null) => void;
    setUsuarios: (usuarios: Usuario[]) => void;
    setUsuarioActual: (usuario: Usuario | null) => void;
}

export default function AjustesScreen({
    setView,
    coupleId,
    setCoupleId,
    setUsuarios,
    setUsuarioActual
}: AjustesScreenProps) {
    const { theme, isDark, toggleTheme } = useTheme();

    // Estado local para sonido (simulado por ahora)
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Colores dinámicos del tema
    const { colors } = theme;

    const handleResetData = () => {
        Alert.alert(
            "🚧 Zona de Peligro",
            "¿Estás seguro de que quieres borrar TODOS los datos locales y cerrar sesión? Esto no borrará la base de datos en la nube si está sincronizada, pero desconectará este dispositivo.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sí, borrar todo",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            // Mantener el tema si se desea, o borrar todo. Aquí borramos todo.
                            setCoupleId(null);
                            setUsuarios([]);
                            setUsuarioActual(null);
                            setView("inicio"); // Volver a login/inicio
                            Alert.alert("Datos borrados", "La aplicación se ha reiniciado.");
                        } catch (e) {
                            Alert.alert("Error", "No se pudieron borrar algunos datos.");
                        }
                    }
                }
            ]
        );
    };

    const SectionHeader = ({ title, children }: { title: string; children?: React.ReactNode }) => (
        <Text style={{
            color: colors.muted,
            fontSize: 13,
            fontWeight: '700',
            marginTop: 20,
            marginBottom: 8,
            marginLeft: 4,
            textTransform: 'uppercase'
        }}>
            {title}
        </Text>
    );

    const OptionRow = ({
        icon,
        label,
        children,
        onPress,
        danger = false
    }: {
        icon: string;
        label: string;
        children?: React.ReactNode;
        onPress?: () => void;
        danger?: boolean;
    }) => (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.card,
                padding: 16,
                borderRadius: 16,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: danger ? colors.danger : 'transparent'
            }}
        >
            <Text style={{ fontSize: 24, marginRight: 15 }}>{icon}</Text>
            <Text style={{
                flex: 1,
                color: danger ? colors.danger : colors.text,
                fontSize: 16,
                fontWeight: '600'
            }}>
                {label}
            </Text>
            {children}
        </TouchableOpacity>
    );

    return (
        <Container>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <View style={{ marginBottom: 20, marginTop: 10 }}>
                    <Text style={{ fontSize: 32, fontWeight: '800', color: colors.accent }}>
                        Ajustes
                    </Text>
                    <Text style={{ color: colors.text, opacity: 0.8 }}>
                        Personaliza tu experiencia
                    </Text>
                </View>

                {/* Sección: General */}
                <SectionHeader title="General" />

                <OptionRow
                    icon={isDark ? "🌙" : "☀️"}
                    label="Modo Oscuro"
                >
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: "#767577", true: colors.primary }}
                        thumbColor={isDark ? "#fff" : "#f4f3f4"}
                    />
                </OptionRow>

                <OptionRow
                    icon={soundEnabled ? "🔊" : "🔇"}
                    label="Efectos de Sonido"
                >
                    <Switch
                        value={soundEnabled}
                        onValueChange={setSoundEnabled}
                        trackColor={{ false: "#767577", true: colors.success }}
                        thumbColor={soundEnabled ? "#fff" : "#f4f3f4"}
                    />
                </OptionRow>

                {/* Sección: Pantallas */}
                <SectionHeader title="Accesos Directos" />

                <OptionRow
                    icon="📊"
                    label="Ver Estadísticas"
                    onPress={() => setView('estadisticas')}
                >
                    <Text style={{ color: colors.muted, fontSize: 20 }}>›</Text>
                </OptionRow>

                {/* Sección: Datos y Cuenta */}
                <SectionHeader title="Datos y Privacidad" />

                <OptionRow
                    icon="🗑️"
                    label="Restablecer Datos"
                    danger
                    onPress={handleResetData}
                />

                {/* Sección: Información */}
                <SectionHeader title="Información" />

                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={{ fontSize: 40, marginBottom: 10 }}>💑</Text>
                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>Ruleta de Planes</Text>
                    <Text style={{ color: colors.muted, fontSize: 12 }}>Versión 1.2.0 (Theme Edition)</Text>
                    <Text style={{ color: colors.muted, fontSize: 10, marginTop: 5 }}>Hecho con ❤️ por Alex para V</Text>
                </View>

            </ScrollView>

            {/* Botón Volver */}
            <TouchableOpacity
                onPress={() => setView("inicio")}
                style={{
                    position: "absolute",
                    bottom: 30,
                    left: 20,
                    backgroundColor: colors.warning,
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 30,
                    shadowColor: "#000",
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                    ⬅ Volver
                </Text>
            </TouchableOpacity>
        </Container>
    );
}
