import React from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

const Loading: React.FC<{ text?: string }> = ({ text = "Yükleniyor..." }) => {
  // Use same asset resolution approach as Login to avoid web runtime issues
  const localLogo = require("../../assets/images/favicon.png");
  let logoUri: string | undefined;
  if (Platform.OS === "web") {
    try {
      const resolver = (Image as any).resolveAssetSource;
      const resolved =
        typeof resolver === "function" ? resolver(localLogo) : null;
      logoUri =
        resolved?.uri ??
        (localLogo as any)?.uri ??
        (localLogo as any)?.default ??
        undefined;
    } catch (_e) {
      logoUri =
        (localLogo as any)?.uri ?? (localLogo as any)?.default ?? undefined;
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.logoWrapper}>
        {Platform.OS === "web" ? (
          // @ts-ignore
          <img
            src={logoUri}
            alt="AEU OBS"
            title="AEU OBS"
            style={{ width: 80, height: 80, objectFit: "contain" }}
          />
        ) : (
          <Image
            source={localLogo}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        )}
      </View>
      <ActivityIndicator size="large" color="#181818" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: 12,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
});

export default Loading;
