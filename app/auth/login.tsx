import { LoginTexts } from "@/components/texts/login-texts";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ApiConfig from "../../utils/api-config";
import { getCookie, setCookie } from "../../utils/cookies";
import { ROUTES } from "../router";

const Login: React.FC = () => {
  const router = useRouter();
  const [userType, setUserType] = useState<"student" | "other">("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const slideAnim = useRef(new Animated.Value(300)).current;
  const styles = themedStyles("light");
  // Resolve local logo asset so web gets the correct served URL
  const localLogo = require("../../assets/images/favicon.png");
  let logoUri: string | undefined;
  if (Platform.OS === "web") {
    try {
      const resolver = (Image as any).resolveAssetSource;
      const resolved =
        typeof resolver === "function" ? resolver(localLogo) : null;
      logoUri =
        resolved?.uri ??
        (localLogo?.uri as string) ??
        (localLogo as any)?.default ??
        undefined;
    } catch (_e) {
      logoUri =
        (localLogo as any)?.uri ?? (localLogo as any)?.default ?? undefined;
    }
  }

  useEffect(() => {
    // Eğer kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
    const timer = setTimeout(() => {
      const token = getCookie("accessToken");
      if (token) {
        router.replace(ROUTES.DASHBOARD);
      } else {
        setIsChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  // Store token in memory for demo; use secure storage in production
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const handleLoginPress = async () => {
    if (isLoggingIn || !username || !password) return;

    setIsLoggingIn(true);
    try {
      // If username or password is empty, send null as in the curl example
      const body = {
        email: username || null,
        password: password || null,
      };
      const response = await fetch(`${ApiConfig.baseUrl}/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (response.status === 200) {
        const data = await response.json();
        if (data?.data?.accessToken) {
          setAccessToken(data.data.accessToken);
          // Store in cookie with expiration from app.json
          setCookie(
            "accessToken",
            data.data.accessToken,
            ApiConfig.cookieExpirationMinutes,
          );
        }
        console.log(LoginTexts.loginSuccessful, data);
        router.replace(ROUTES.DASHBOARD);
      } else {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.message || LoginTexts.loginError;
        setErrorMessage(message);
        slideAnim.setValue(300);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }).start();
        setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: 300,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setErrorMessage(""));
        }, 5000);
        console.log("Login failed");
        setIsLoggingIn(false);
      }
    } catch (e) {
      setErrorMessage("Bağlantı hatası. Lütfen tekrar deneyin.");
      slideAnim.setValue(300);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }).start();
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setErrorMessage(""));
      }, 5000);
      console.log("Error during login: ", e);
      setIsLoggingIn(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 18, color: "#666" }}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ marginBottom: 12, alignItems: "center" }}>
        {Platform.OS === "web" ? (
          // @ts-ignore - use resolved asset URI for web
          <img
            src={logoUri}
            alt="AEU OBS"
            title="AEU OBS"
            style={{ width: 120, height: 120, objectFit: "contain" }}
          />
        ) : (
          <Image
            source={localLogo}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        )}
      </View>
      <Text style={styles.title}>{LoginTexts.title}</Text>
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.switchButton,
            userType === "student" && styles.switchButtonActive,
          ]}
          onPress={() => setUserType("student")}
        >
          <Text style={styles.switchText}>{LoginTexts.student}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.switchButton,
            userType === "other" && styles.switchButtonActive,
          ]}
          onPress={() => setUserType("other")}
        >
          <Text style={styles.switchText}>{LoginTexts.other}</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder={
          userType === "student"
            ? LoginTexts.studentPlaceholder
            : LoginTexts.otherPlaceholder
        }
        placeholderTextColor={"#666"}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        returnKeyType="next"
        editable={!isLoggingIn}
      />
      <TextInput
        style={styles.input}
        placeholder={LoginTexts.password}
        placeholderTextColor={"#666"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        returnKeyType="go"
        onSubmitEditing={handleLoginPress}
        editable={!isLoggingIn}
      />
      <TouchableOpacity
        style={[
          styles.loginButton,
          (isLoggingIn || !username || !password) && styles.loginButtonDisabled,
        ]}
        onPress={handleLoginPress}
        disabled={isLoggingIn || !username || !password}
      >
        <Text style={styles.loginButtonText}>
          {isLoggingIn ? "Giriş yapılıyor..." : LoginTexts.login}
        </Text>
      </TouchableOpacity>
      {errorMessage && (
        <Animated.View
          style={[
            styles.errorToast,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <Text style={styles.errorToastText}>{errorMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const themedStyles = (_theme: "light") =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
      padding: 24,
      marginHorizontal: "1%",
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#181818",
      marginBottom: 32,
    },
    switchContainer: {
      flexDirection: "row",
      marginBottom: 24,
      backgroundColor: "#eee",
      borderRadius: 8,
      overflow: "hidden",
    },
    switchButton: {
      paddingVertical: 10,
      paddingHorizontal: 24,
      backgroundColor: "transparent",
    },
    switchButtonActive: {
      backgroundColor: "#ddd",
    },
    switchText: {
      color: "#181818",
      fontWeight: "600",
      fontSize: 16,
    },
    input: {
      width: Platform.OS === "web" ? 320 : "80%",
      padding: 12,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      backgroundColor: "#fafafa",
      color: "#181818",
      fontSize: 16,
    },
    loginButton: {
      marginTop: 24,
      backgroundColor: "#181818",
      paddingVertical: 14,
      paddingHorizontal: 48,
      borderRadius: 8,
      alignItems: "center",
    },
    loginButtonDisabled: {
      backgroundColor: "#999",
      opacity: 0.6,
    },
    loginButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 18,
    },
    errorToast: {
      position: "absolute",
      top: 20,
      right: 0,
      width: "25%",
      minWidth: 300,
      backgroundColor: "#fff",
      borderLeftWidth: 5,
      borderLeftColor: "#dc3545",
      paddingVertical: 20,
      paddingHorizontal: 24,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: -2, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    errorToastText: {
      color: "#dc3545",
      fontSize: 15,
      textAlign: "left",
      fontWeight: "bold",
      lineHeight: 22,
    },
  });

export default Login;
