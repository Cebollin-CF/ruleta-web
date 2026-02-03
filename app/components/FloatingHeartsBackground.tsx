// app/components/WebFloatingHearts.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const WebFloatingHearts = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !containerRef.current) return;

    // Crear corazones con CSS PURO (no se mueven con teclado)
    const container = containerRef.current;
    const hearts = 25;
    
    for (let i = 0; i < hearts; i++) {
      const heart = document.createElement('div');
      const size = 12 + Math.random() * 18;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const opacity = 0.08 + Math.random() * 0.12;
      const rotation = Math.random() * 360;
      
      heart.innerHTML = '❤️';
      heart.style.position = 'fixed'; // ✅ FIXED, no absolute
      heart.style.left = `${left}%`;
      heart.style.top = `${top}%`;
      heart.style.fontSize = `${size}px`;
      heart.style.opacity = opacity;
      heart.style.color = 'rgba(255, 179, 209, 0.7)';
      heart.style.transform = `rotate(${rotation}deg)`;
      heart.style.pointerEvents = 'none';
      heart.style.zIndex = '-9999';
      heart.style.userSelect = 'none';
      
      container.appendChild(heart);
    }

    // Limpiar al desmontar
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return Platform.OS === 'web' ? (
    <View 
      ref={containerRef}
      style={styles.webContainer}
      pointerEvents="none"
    />
  ) : null;
};

const styles = StyleSheet.create({
  webContainer: {
    position: 'fixed', // ✅ FIXED para web
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -9999,
    pointerEvents: 'none',
  },
});

export default WebFloatingHearts;