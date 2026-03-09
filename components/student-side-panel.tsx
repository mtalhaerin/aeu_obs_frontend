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
import { IconSymbol } from "./ui/icon-symbol";

export interface StudentMenuItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  action?: () => void;
}

export interface StudentMenuCategory {
  id: string;
  title: string;
  icon?: string;
  items: StudentMenuItem[];
}

interface StudentSidePanelProps {
  userName?: string;
  isCollapsed?: boolean;
  onMenuItemPress?: (item: StudentMenuItem) => void;
}

const StudentSidePanel: React.FC<StudentSidePanelProps> = ({
  userName = "Öğrenci",
  isCollapsed = false,
  onMenuItemPress,
}) => {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "dashboard",
  ]);

  const categories: StudentMenuCategory[] = [
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
          id: "dashboard-announcements",
          label: "Duyurular",
          route: "/dashboard/announcements",
        },
      ],
    },
    {
      id: "courses",
      title: "Dersler",
      icon: "book",
      items: [
        {
          id: "courses-enrolled",
          label: "Aldığım Dersler",
          route: "/dashboard/student/courses",
        },
        {
          id: "courses-registration",
          label: "Ders Kaydı",
          route: "/dashboard/student/registration",
        },
        {
          id: "courses-schedule",
          label: "Ders Programı",
          route: "/dashboard/student/schedule",
        },
      ],
    },
    {
      id: "grades",
      title: "Notlar",
      icon: "chart.bar",
      items: [
        {
          id: "grades-transcript",
          label: "Transkript",
          route: "/dashboard/student/transcript",
        },
        {
          id: "grades-semester",
          label: "Dönem Notları",
          route: "/dashboard/student/grades",
        },
        {
          id: "grades-gpa",
          label: "GPA Hesaplama",
          route: "/dashboard/student/gpa",
        },
      ],
    },
    {
      id: "profile",
      title: "Profil",
      icon: "person",
      items: [
        {
          id: "profile-info",
          label: "Kişisel Bilgiler",
          route: "/dashboard/profile",
        },
        {
          id: "profile-documents",
          label: "Belgelerim",
          route: "/dashboard/student/documents",
        },
        {
          id: "profile-photo",
          label: "Fotoğraf Güncelle",
          route: "/dashboard/student/photo",
        },
      ],
    },
    {
      id: "services",
      title: "Öğrenci Hizmetleri",
      icon: "graduationcap",
      items: [
        {
          id: "services-petition",
          label: "Dilekçe",
          route: "/dashboard/student/petition",
        },
        {
          id: "services-dormitory",
          label: "Yurt Başvurusu",
          route: "/dashboard/student/dormitory",
        },
        {
          id: "services-scholarship",
          label: "Burs Başvurusu",
          route: "/dashboard/student/scholarship",
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

  const handleMenuItemPress = (item: StudentMenuItem) => {
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
        <Text style={styles.headerTitle}>Öğrenci Paneli</Text>
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
                    color="#5a7ba7"
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
    backgroundColor: "#e8f4fd",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a5f",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#5a7ba7",
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
    backgroundColor: "#f0f7ff",
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
    color: "#1e3a5f",
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
    backgroundColor: "#4a90e2",
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
    backgroundColor: "#e8f4fd",
  },
  footerText: {
    fontSize: 11,
    color: "#DAA520",
    fontWeight: "500",
  },
});

export default StudentSidePanel;
