import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Modal, 
  TextInput,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Container from '../components/Container';
import colors from '../utils/colors';
import type { Usuario } from '../utils/types';

interface SeleccionarUsuarioScreenProps {
  usuarios: Usuario[];
  onSeleccionarUsuario: (usuario: Usuario) => void;
  setView: () => void;
  actualizarUsuario: (usuarioId: string, datos: Partial<Usuario>) => Promise<any>;
  subirAvatarUsuario: (uri: string, usuarioId: string) => Promise<void>;
}

export default function SeleccionarUsuarioScreen({ 
  usuarios, 
  onSeleccionarUsuario,
  setView,
  actualizarUsuario,
  subirAvatarUsuario
}: SeleccionarUsuarioScreenProps) {
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState('');

  const handleSeleccionarFoto = async (usuario: Usuario) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await subirAvatarUsuario(result.assets[0].uri, usuario.id);
    }
  };

  const handleEditarNombre = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setNuevoNombre(usuario.nombre);
    setMostrarEditar(true);
  };

  const guardarNombre = async () => {
    if (!usuarioEditando || !nuevoNombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    const resultado = await actualizarUsuario(usuarioEditando.id, {
      nombre: nuevoNombre.trim()
    });

    if (resultado.success) {
      setMostrarEditar(false);
      setUsuarioEditando(null);
      setNuevoNombre('');
    } else {
      Alert.alert('Error', 'No se pudo actualizar el nombre');
    }
  };

  return (
    <Container>
      <Text style={{
        color: colors.accent,
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 40,
        textAlign: 'center'
      }}>
        👥 ¿Quién está usando?
      </Text>

      <View style={{ alignItems: 'center', gap: 25 }}>
        {usuarios.map((usuario) => (
          <View key={usuario.id} style={{ alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => onSeleccionarUsuario(usuario)}
              style={{
                backgroundColor: colors.card,
                padding: 25,
                borderRadius: 20,
                width: 280,
                alignItems: 'center',
                borderWidth: 3,
                borderColor: colors.primary,
              }}
            >
              <TouchableOpacity
                onPress={() => handleSeleccionarFoto(usuario)}
                style={{ marginBottom: 15 }}
              >
                {usuario.avatar_url ? (
                  <Image 
                    source={{ uri: usuario.avatar_url }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                    }}
                  />
                ) : (
                  <View style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: colors.secondary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: colors.accent,
                  }}>
                    <Text style={{ fontSize: 40 }}>
                      {usuario.usuario_numero === 1 ? '👨' : '👩'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <Text style={{
                color: colors.text,
                fontSize: 22,
                fontWeight: '700',
                marginBottom: 5,
                textAlign: 'center'
              }}>
                {usuario.nombre}
              </Text>
              
              <Text style={{
                color: colors.muted,
                fontSize: 14,
                marginBottom: 15
              }}>
                {usuario.usuario_numero === 1 ? 'Usuario principal' : 'Segundo usuario'}
              </Text>

              <TouchableOpacity
                onPress={() => handleEditarNombre(usuario)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: colors.accent, fontSize: 12, marginRight: 5 }}>
                  ✏️ Cambiar nombre
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <Text style={{
              color: colors.muted,
              fontSize: 12,
              marginTop: 10
            }}>
              Toca la foto para cambiarla
            </Text>
          </View>
        ))}
      </View>

      {/* Modal para editar nombre */}
      <Modal
        visible={mostrarEditar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMostrarEditar(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: colors.bgBottom,
            borderRadius: 20,
            padding: 25,
            width: '90%',
            maxWidth: 400,
            borderWidth: 2,
            borderColor: colors.primary
          }}>
            <Text style={{
              color: colors.accent,
              fontSize: 22,
              fontWeight: '800',
              marginBottom: 20,
              textAlign: 'center'
            }}>
              ✏️ Cambiar nombre
            </Text>

            <TextInput
              placeholder="Nuevo nombre"
              placeholderTextColor={colors.muted}
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
              style={{
                backgroundColor: colors.card,
                color: colors.text,
                padding: 15,
                borderRadius: 15,
                marginBottom: 20,
                fontSize: 16,
                borderWidth: 2,
                borderColor: colors.primary
              }}
              autoFocus
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setMostrarEditar(false)}
                style={{
                  flex: 1,
                  backgroundColor: colors.muted,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={guardarNombre}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Botón volver */}
      <TouchableOpacity
        onPress={setView}
        style={{
          position: 'absolute',
          bottom: 30,
          left: 20,
          backgroundColor: colors.warning,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: 30,
          elevation: 6,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
          ⬅ Volver
        </Text>
      </TouchableOpacity>
    </Container>
  );
}
