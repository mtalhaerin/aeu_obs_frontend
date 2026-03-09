import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TooltipProps {
  visible: boolean;
  text: string;
  position?: "top" | "bottom";
  onHide?: () => void;
}

export const Tooltip: React.FC<TooltipProps> = ({
  visible,
  text,
  position = "top",
  onHide,
}) => {
  if (!visible) return null;

  return (
    <View
      style={[
        styles.tooltip,
        position === "top" ? styles.tooltipTop : styles.tooltipBottom,
      ]}
    >
      <Text style={styles.tooltipText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -75 }], // Half of tooltip width for centering
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 150,
  },
  tooltipTop: {
    top: 30,
  },
  tooltipBottom: {
    bottom: 30,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
