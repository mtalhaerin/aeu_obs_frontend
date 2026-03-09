import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import NavigationBar from "../../components/panels/navigation-panels/navigation-bar";
import AcademicSidePanel from "../../components/panels/side-panels/academic-side-panel";
import AdminSidePanel from "../../components/panels/side-panels/admin-side-panel";
import StudentSidePanel from "../../components/panels/side-panels/student-side-panel";
import { DashboardTexts } from "../../components/texts/dashboard-texts";
import { IconSymbol } from "../../components/ui/icon-symbol";
import Loading from "../../components/ui/loading";
import { IdentityType } from "../../constants/identity-types";
import ApiConfig from "../../utils/api-config";
import { getCookie, setCookie } from "../../utils/cookies";
import { getIdentityTypeFromToken } from "../../utils/jwt";
import { ROUTES } from "../router";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isChecking, setIsChecking] = useState(true);
  const [identityType, setIdentityType] = useState<IdentityType | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Token refresh function
  const refreshToken = async () => {
    try {
      const currentToken = getCookie("accessToken");
      if (!currentToken) {
        router.replace(ROUTES.LOGIN as any);
        return;
      }

      const response = await fetch(`${ApiConfig.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        if (data?.data?.accessToken) {
          // Update token in cookie
          setCookie(
            "accessToken",
            data.data.accessToken,
            ApiConfig.cookieExpirationMinutes,
          );
          console.log(DashboardTexts.tokenRefreshSuccess);
        }
      } else {
        // Refresh failed, redirect to login
        console.log(DashboardTexts.tokenRefreshFailed);
        router.replace(ROUTES.LOGIN as any);
      }
    } catch (error) {
      console.error(DashboardTexts.tokenRefreshError, error);
      // On error, redirect to login
      router.replace(ROUTES.LOGIN as any);
    }
  };

  useEffect(() => {
    // Delay navigation slightly to avoid "navigate before mounting" errors
    const t = setTimeout(() => {
      const token = getCookie("accessToken");
      if (!token) {
        router.replace(ROUTES.LOGIN as any);
      } else {
        // JWT'den identity_type'ı oku
        const userIdentityType = getIdentityTypeFromToken(token);
        setIdentityType(userIdentityType);
        setIsChecking(false);

        // Set up token refresh interval (every 5 minutes = 300000ms)
        refreshIntervalRef.current = setInterval(
          () => {
            refreshToken();
          },
          5 * 60 * 1000,
        );
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(t);
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [router]);

  if (isChecking) {
    return (
      <View style={styles.container}>
        <Loading text={DashboardTexts.loading} />
      </View>
    );
  }

  // Kullanıcı tipine göre panel seçimi
  const isAdmin = identityType === IdentityType.PERSONEL;
  const isAcademic = identityType === IdentityType.AKADEMISYEN;
  const isStudent = identityType === IdentityType.OGRENCI;
  const showSidePanel = isAdmin || isAcademic || isStudent;

  return (
    <View style={styles.container}>
      <NavigationBar userName="Kullanıcı" />
      <View style={styles.mainContent}>
        {/* Kullanıcı tipine göre side panel göster */}
        {showSidePanel && (
          <>
            {isAdmin && (
              <AdminSidePanel
                userName="Admin Kullanıcı"
                isCollapsed={isPanelCollapsed}
              />
            )}
            {isAcademic && (
              <AcademicSidePanel
                userName="Akademik Kullanıcı"
                isCollapsed={isPanelCollapsed}
              />
            )}
            {isStudent && (
              <StudentSidePanel
                userName="Öğrenci Kullanıcı"
                isCollapsed={isPanelCollapsed}
              />
            )}

            {/* Toggle Button */}
            <Pressable
              style={[
                styles.toggleButton,
                isPanelCollapsed
                  ? styles.toggleButtonCollapsed
                  : styles.toggleButtonExpanded,
              ]}
              onPress={() => setIsPanelCollapsed(!isPanelCollapsed)}
            >
              <IconSymbol
                name={isPanelCollapsed ? "chevron.right" : "chevron.down"}
                size={18}
                color="#666"
              />
            </Pressable>
          </>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{DashboardTexts.welcome}</Text>
          <Text style={styles.subtitle}>{DashboardTexts.selectAction}</Text>
          {identityType && (
            <Text style={styles.userType}>Kullanıcı Türü: {identityType}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    userSelect: "none",
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
    position: "relative",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginHorizontal: "1%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#181818",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
  },
  userType: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginTop: 16,
  },
  toggleButton: {
    position: "absolute",
    top: 20,
    zIndex: 1000,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    cursor: Platform.OS === "web" ? "pointer" : undefined,
  },
  toggleButtonExpanded: {
    left: 268,
  },
  toggleButtonCollapsed: {
    left: 12,
  },
  toggleButtonText: {
    fontSize: 14,
    color: "#181818",
    fontWeight: "bold",
  },
});

export default Dashboard;
