// components/FadeInSlide.js

// Smoothly fades in and slides content upward on mount.
// Used to add subtle motion and visual polish to screen elements.

import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export default function FadeInSlide({
  children,
  delay = 0,
  duration = 400,
  fromY = 10,
  fromOpacity = 0,
  style,
}) {
  const opacity = useRef(new Animated.Value(fromOpacity)).current;
  const translateY = useRef(new Animated.Value(fromY)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [delay, duration, fromY, fromOpacity, opacity, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
