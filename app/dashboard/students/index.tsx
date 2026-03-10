import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { ROUTES } from "../../../app/router";
import NavigationBar from "../../../components/panels/navigation-panels/navigation-bar";
import AdminSidePanel from "../../../components/panels/side-panels/admin-side-panel";
import { IconSymbol } from "../../../components/ui/icon-symbol";
import Loading from "../../../components/ui/loading";
import { IdentityType } from "../../../constants/identity-types";
import { getCookie } from "../../../utils/cookies";
import { getIdentityTypeFromToken } from "../../../utils/jwt";

const StudentsList: React.FC = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [identityType, setIdentityType] = useState<IdentityType | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const token = getCookie("accessToken");
      if (!token) {
        router.replace(ROUTES.LOGIN as any);
      } else {
        const userIdentityType = getIdentityTypeFromToken(token);
        setIdentityType(userIdentityType);
        setIsChecking(false);
      }
    }, 100);
    return () => clearTimeout(t);
  }, [router]);

  if (isChecking) {
    return (
      <View style={styles.container}>
        <Loading text="Yükleniyor..." />
      </View>
    );
  }

  const isAdmin = identityType === IdentityType.PERSONEL;

  return (
    <View style={styles.container}>
      <NavigationBar userName="Öğrenci Listesi" />
      <View style={styles.mainContent}>
        {isAdmin && (
          <>
            <AdminSidePanel
              isCollapsed={isPanelCollapsed}
              onMenuItemPress={(item) => {
                if (item.route) {
                  router.push(item.route as any);
                }
              }}
            />
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
                name="chevron.right"
                size={16}
                color="#666"
                style={
                  isPanelCollapsed ? {} : { transform: [{ rotate: "180deg" }] }
                }
              />
            </Pressable>
          </>
        )}

        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Öğrenci Listesi</Text>
            <Text style={styles.subtitle}>
              Kayıtlı öğrenciler ve öğrenci işlemleri burada görüntülenecek.
            </Text>
          </View>

          <View style={styles.placeholderContainer}>
            <IconSymbol name="person.2" size={48} color="#007AFF" />
            <Text style={styles.placeholderText}>
              Bu sayfa geliştirilme aşamasındadır.
            </Text>
          </View>
        </ScrollView>
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
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#181818",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
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
});

export default StudentsList;
