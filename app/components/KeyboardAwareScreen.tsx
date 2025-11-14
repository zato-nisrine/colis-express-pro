import React, { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface Props {
  children: ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  keyboardVerticalOffset?: number;
  backgroundColor?: string; // option pour fond uniforme
}

function KeyboardAwareScreen({
  children,
  style,
  scrollable = true,
  keyboardVerticalOffset,
  backgroundColor = "#fff",
}: Props) {
  return (
    <View style={[styles.wrapper, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardVerticalOffset ?? (Platform.OS === "ios" ? 60 : 0)}
      >
        {scrollable ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContainer, style]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.nonScrollContainer, style]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

export default KeyboardAwareScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  nonScrollContainer: {
    flex: 1,
  },
});
