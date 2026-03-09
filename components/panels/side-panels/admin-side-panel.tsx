import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "../../ui/icon-symbol";

export interface AdminMenuItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  action?: () => void;
}

export interface AdminMenuCategory {
  id: string;
  title: string;
  icon?: string;
  items: AdminMenuItem[];
}

interface AdminSidePanelProps {
  userName?: string;
  isCollapsed?: boolean;
  onMenuItemPress?: (item: AdminMenuItem) => void;
}

const AdminSidePanel: React.FC<AdminSidePanelProps> = ({
  userName = "Admin",
  isCollapsed = false,
  onMenuItemPress,
}) => {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "dashboard",
  ]);

  const categories: AdminMenuCategory[] = [
    {
      id: "dashboard",
      title: "Ana Sayfa",
      icon: "house",
      items: [
        {
          id: "dashboard-overview",
          label: "Genel Bakış",
          route: "/dashboard/dashboard",
        },
        {
          id: "dashboard-stats",
          label: "İstatistikler",
          route: "/dashboard/stats",
        },
      ],
    },
    {
      id: "users",
      title: "Kullanıcı İşlemleri",
      icon: "person.2",
      items: [
        {
          id: "users-management",
          label: "Kullanıcı Yönetimi",
          route: "/dashboard/admin/user",
        },
      ],
    },
    {
      id: "courses",
      title: "Ders İşlemleri",
      icon: "book",
      items: [
        {
          id: "courses-list",
          label: "Ders Listesi",
          route: "/dashboard/courses",
        },
        {
          id: "courses-create",
          label: "Yeni Ders",
          route: "/dashboard/courses/create",
        },
        {
          id: "courses-schedule",
          label: "Ders Programı",
          route: "/dashboard/courses/schedule",
        },
      ],
    },
    {
      id: "students",
      title: "Öğrenci İşlemleri",
      icon: "graduationcap",
      items: [
        {
          id: "students-list",
          label: "Öğrenci Listesi",
          route: "/dashboard/students",
        },
        {
          id: "students-enrollment",
          label: "Ders Kaydı",
          route: "/dashboard/students/enrollment",
        },
        {
          id: "students-grades",
          label: "Not Girişi",
          route: "/dashboard/students/grades",
        },
      ],
    },
    {
      id: "reports",
      title: "Raporlar",
      icon: "chart.bar",
      items: [
        {
          id: "reports-academic",
          label: "Akademik Raporlar",
          route: "/dashboard/reports/academic",
        },
        {
          id: "reports-attendance",
          label: "Devamsızlık Raporları",
          route: "/dashboard/reports/attendance",
        },
      ],
    },
    {
      id: "settings",
      title: "Ayarlar",
      icon: "gear",
      items: [
        {
          id: "settings-general",
          label: "Genel Ayarlar",
          route: "/dashboard/settings",
        },
        {
          id: "settings-system",
          label: "Sistem Ayarları",
          route: "/dashboard/settings/system",
        },
      ],
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleMenuItemPress = (item: AdminMenuItem) => {
    if (onMenuItemPress) {
      onMenuItemPress(item);
    }

    if (item.action) {
      item.action();
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  if (isCollapsed) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>{userName}</Text>
      </View>

      {/* Menu Categories */}
      <ScrollView
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <View key={category.id} style={styles.categoryContainer}>
              {/* Category Header */}
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.id)}
                activeOpacity={0.7}
              >
                {category.icon && (
                  <IconSymbol
                    name={category.icon}
                    size={16}
                    color="#666"
                    style={styles.categoryIcon}
                  />
                )}
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <View style={styles.categoryArrowIcon}>
                  <IconSymbol
                    name={isExpanded ? "chevron.down" : "chevron.right"}
                    size={18}
                    color="#666"
                  />
                </View>
              </TouchableOpacity>

              {/* Category Items */}
              {isExpanded && (
                <View style={styles.categoryItems}>
                  {category.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuItem}
                      onPress={() => handleMenuItemPress(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuItemDot} />
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>AEU OBS © 2026</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: "#fff",
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#181818",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#666",
  },
  menuContainer: {
    flex: 1,
    padding: 8,
  },
  categoryContainer: {
    marginBottom: 4,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginBottom: 2,
    cursor: Platform.OS === "web" ? "pointer" : undefined,
  },
  categoryIcon: {
    marginRight: 10,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#181818",
  },
  categoryArrowIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  categoryItems: {
    paddingLeft: 16,
    marginTop: 2,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 2,
    cursor: Platform.OS === "web" ? "pointer" : undefined,
  },
  menuItemDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#999",
    marginRight: 10,
  },
  menuLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "400",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  footerText: {
    fontSize: 11,
    color: "#DAA520",
    fontWeight: "600",
  },
});

export default AdminSidePanel;
