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

export interface AcademicMenuItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  action?: () => void;
}

export interface AcademicMenuCategory {
  id: string;
  title: string;
  icon?: string;
  items: AcademicMenuItem[];
}

interface AcademicSidePanelProps {
  userName?: string;
  isCollapsed?: boolean;
  onMenuItemPress?: (item: AcademicMenuItem) => void;
}

const AcademicSidePanel: React.FC<AcademicSidePanelProps> = ({
  userName = "Akademisyen",
  isCollapsed = false,
  onMenuItemPress,
}) => {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "dashboard",
  ]);

  const categories: AcademicMenuCategory[] = [
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
          id: "dashboard-calendar",
          label: "Akademik Takvim",
          route: "/dashboard/academic/calendar",
        },
      ],
    },
    {
      id: "courses",
      title: "Dersler",
      icon: "book",
      items: [
        {
          id: "courses-my-courses",
          label: "Verdiğim Dersler",
          route: "/dashboard/academic/courses",
        },
        {
          id: "courses-schedule",
          label: "Ders Programı",
          route: "/dashboard/academic/schedule",
        },
        {
          id: "courses-materials",
          label: "Ders Materyalleri",
          route: "/dashboard/academic/materials",
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
          route: "/dashboard/academic/students",
        },
        {
          id: "students-grades",
          label: "Not Girişi",
          route: "/dashboard/academic/grades",
        },
        {
          id: "students-attendance",
          label: "Devam Takibi",
          route: "/dashboard/academic/attendance",
        },
      ],
    },
    {
      id: "exams",
      title: "Sınavlar",
      icon: "pencil",
      items: [
        {
          id: "exams-schedule",
          label: "Sınav Programı",
          route: "/dashboard/academic/exam-schedule",
        },
        {
          id: "exams-create",
          label: "Sınav Oluştur",
          route: "/dashboard/academic/create-exam",
        },
        {
          id: "exams-results",
          label: "Sınav Sonuçları",
          route: "/dashboard/academic/exam-results",
        },
      ],
    },
    {
      id: "research",
      title: "Araştırma",
      icon: "flask",
      items: [
        {
          id: "research-projects",
          label: "Projeler",
          route: "/dashboard/academic/projects",
        },
        {
          id: "research-publications",
          label: "Yayınlar",
          route: "/dashboard/academic/publications",
        },
        {
          id: "research-supervision",
          label: "Danışmanlık",
          route: "/dashboard/academic/supervision",
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
          id: "profile-cv",
          label: "Özgeçmiş",
          route: "/dashboard/academic/cv",
        },
        {
          id: "profile-office-hours",
          label: "Ofis Saatleri",
          route: "/dashboard/academic/office-hours",
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

  const handleMenuItemPress = (item: AcademicMenuItem) => {
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
        <Text style={styles.headerTitle}>Akademik Panel</Text>
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
                    color="#5a7c3a"
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
    backgroundColor: "#f0f8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d5016",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#5a7c3a",
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
    backgroundColor: "#f7fef7",
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
    color: "#2d5016",
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
    backgroundColor: "#4caf50",
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
    backgroundColor: "#f0f8f0",
  },
  footerText: {
    fontSize: 11,
    color: "#DAA520",
    fontWeight: "500",
  },
});

export default AcademicSidePanel;
