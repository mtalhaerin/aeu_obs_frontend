import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import AdminSidePanel from "../../../components/admin-side-panel";
import Loading from "../../../components/loading";
import NavigationBar from "../../../components/navigation-bar";
import { IconSymbol } from "../../../components/ui/icon-symbol";
import { IdentityType } from "../../../constants/identity-types";
import {
    User,
    userAPI,
    UserCreateRequest,
    UserUpdateRequest,
} from "../../../services/user-api";
import { getCookie } from "../../../utils/cookies";
import { getIdentityTypeFromToken } from "../../../utils/jwt";
import { ROUTES } from "../../router";

type ViewMode = "list" | "new" | "edit";

// Kullanıcı Tipi Enum
enum KullaniciTipi {
  OGRENCI = 0,
  AKADEMISYEN = 1,
  PERSONEL = 2,
}

const getUserTypeLabel = (type: KullaniciTipi): string => {
  switch (type) {
    case KullaniciTipi.OGRENCI:
      return "Öğrenci";
    case KullaniciTipi.AKADEMISYEN:
      return "Akademisyen";
    case KullaniciTipi.PERSONEL:
      return "Personel";
    default:
      return "Bilinmeyen";
  }
};

const getDefaultPatterns = (type: KullaniciTipi) => {
  switch (type) {
    case KullaniciTipi.OGRENCI:
      return {
        kurumSicilNo: "222511000",
        kurumEposta: "ornek.ornek@ahievran.edu.tr",
      };
    case KullaniciTipi.AKADEMISYEN:
      return {
        kurumSicilNo: "AKD003",
        kurumEposta: "ornek.ornek@ahievran.edu.tr",
      };
    case KullaniciTipi.PERSONEL:
      return {
        kurumSicilNo: "PRS002",
        kurumEposta: "ornek.ornek@ahievran.edu.tr",
      };
    default:
      return {
        kurumSicilNo: "222511000",
        kurumEposta: "ornek.ornek@ahievran.edu.tr",
      };
  }
};

// Form validation
const validateForm = (formData: any) => {
  const errors: { [key: string]: boolean } = {};

  if (
    !formData.kurumEposta ||
    formData.kurumEposta === "ornek.ornek@ahievran.edu.tr"
  ) {
    errors.kurumEposta = true;
  }

  if (
    !formData.kurumSicilNo ||
    formData.kurumSicilNo === "222511000" ||
    formData.kurumSicilNo === "AKD003" ||
    formData.kurumSicilNo === "PRS002"
  ) {
    errors.kurumSicilNo = true;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@ahievran\.edu\.tr$/;
  if (formData.kurumEposta && !emailRegex.test(formData.kurumEposta)) {
    errors.kurumEposta = true;
  }

  return errors;
};

const UserManagement: React.FC = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [identityType, setIdentityType] = useState<IdentityType | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // User data states
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form validation states
  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});

  // Form states
  const [formData, setFormData] = useState({
    kullaniciTipi: KullaniciTipi.OGRENCI,
    ad: "",
    ortaAd: "",
    soyad: "",
    kurumEposta: "ornek.ornek@ahievran.edu.tr",
    kurumSicilNo: "222511000",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Reduced page size
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);

  // Search/Filter states
  const [searchFilters, setSearchFilters] = useState({
    kullaniciTipi: undefined as number | undefined,
    ad: "",
    soyad: "",
    kurumEposta: "",
    kurumSicilNo: "",
  });

  useEffect(() => {
    const t = setTimeout(() => {
      const token = getCookie("accessToken");
      if (!token) {
        router.replace(ROUTES.LOGIN as any);
      } else {
        const userIdentityType = getIdentityTypeFromToken(token);
        setIdentityType(userIdentityType);
        setIsChecking(false);
        loadUsers();
      }
    }, 100);
    return () => clearTimeout(t);
  }, [router]);

  // Validate form whenever formData changes
  useEffect(() => {
    const errors = validateForm(formData);
    setFormErrors(errors);
  }, [formData]);

  const loadUsers = async (page = currentPage, filters = searchFilters) => {
    try {
      setLoading(true);

      const response = await userAPI.getUsers({
        page,
        pageSize,
        ...filters,
      });

      const users = response.data || [];
      setUsers(users);
      setTotalUsers(response.total || 0);
      setCurrentPage(page);

      // Son sayfa kontrolü - dönen veri miktarı pageSize'dan azsa son sayfadayız
      setIsLastPage(users.length < pageSize);
    } catch (error: any) {
      console.error("Load users error:", error);
      Alert.alert(
        "Hata",
        error.message || "Kullanıcılar yüklenirken hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setUsers([]); // Clear current users for immediate visual feedback
    loadUsers(currentPage, searchFilters);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setIsLastPage(false);
    loadUsers(1, searchFilters);
  };

  const handleViewModeChange = (mode: ViewMode, user?: User) => {
    setViewMode(mode);
    if (mode === "edit" && user) {
      setEditingUser(user);
      setFormData({
        kullaniciTipi: user.kullaniciTipi,
        ad: user.ad || "",
        ortaAd: user.ortaAd || "",
        soyad: user.soyad || "",
        kurumEposta: user.kurumEposta,
        kurumSicilNo: user.kurumSicilNo,
      });
    } else if (mode === "new") {
      setEditingUser(null);
      const defaultPatterns = getDefaultPatterns(KullaniciTipi.OGRENCI);
      setFormData({
        kullaniciTipi: KullaniciTipi.OGRENCI,
        ad: "",
        ortaAd: "",
        soyad: "",
        kurumEposta: defaultPatterns.kurumEposta,
        kurumSicilNo: defaultPatterns.kurumSicilNo,
      });
    }
    setFormErrors({});
  };

  const isFormValid = () => {
    const errors = validateForm(formData);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!isFormValid()) {
      Alert.alert("Hata", "Lütfen tüm alanları doğru şekilde doldurunuz.");
      return;
    }

    try {
      setLoading(true);
      const createData: UserCreateRequest = {
        kullaniciTipi: formData.kullaniciTipi,
        ad: formData.ad || null,
        ortaAd: formData.ortaAd || null,
        soyad: formData.soyad || null,
        kurumEposta: formData.kurumEposta,
        kurumSicilNo: formData.kurumSicilNo,
      };

      await userAPI.createUser(createData);
      Alert.alert("Başarılı", "Kullanıcı başarıyla oluşturuldu.");
      setViewMode("list");
      loadUsers();
    } catch (error: any) {
      Alert.alert(
        "Hata",
        error.message || "Kullanıcı oluşturulurken hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!isFormValid()) {
      Alert.alert("Hata", "Lütfen tüm alanları doğru şekilde doldurunuz.");
      return;
    }

    if (!editingUser) {
      Alert.alert("Hata", "Düzenlenecek kullanıcı bulunamadı.");
      return;
    }

    try {
      setLoading(true);
      const updateData: UserUpdateRequest = {
        kullaniciUuid: editingUser.kullaniciUuid,
        kullaniciTipi: formData.kullaniciTipi,
        ad: formData.ad || null,
        ortaAd: formData.ortaAd || null,
        soyad: formData.soyad || null,
        kurumEposta: formData.kurumEposta,
        kurumSicilNo: formData.kurumSicilNo,
      };

      await userAPI.updateUser(updateData);
      Alert.alert("Başarılı", "Kullanıcı başarıyla güncellendi.");
      setViewMode("list");
      loadUsers();
    } catch (error: any) {
      Alert.alert(
        "Hata",
        error.message || "Kullanıcı güncellenirken hata oluştu.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    const fullName =
      `${user.ad || ""} ${user.ortaAd || ""} ${user.soyad || ""}`.trim() ||
      user.kurumEposta;
    try {
      setLoading(true);

      await userAPI.deleteUser(user.kullaniciUuid);

      // Liste güncelleme
      await loadUsers(currentPage, searchFilters);

      Alert.alert("Başarılı", "Kullanıcı silindi");
    } catch (error: any) {
      Alert.alert("Hata", error.message || "Silme işlemi başarısız");
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <Loading text="Yükleniyor..." />
      </View>
    );
  }

  const isAdmin = identityType === IdentityType.PERSONEL;

  const renderSearchFilters = () => (
    <View style={styles.searchContainer}>
      <Text style={styles.searchTitle}>Arama Filtreleri</Text>
      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Kullanıcı Tipi</Text>
          <View style={styles.smallPickerContainer}>
            <Picker
              selectedValue={searchFilters.kullaniciTipi}
              style={styles.smallPicker}
              onValueChange={(value) =>
                setSearchFilters((prev) => ({
                  ...prev,
                  kullaniciTipi: value === -1 ? undefined : value,
                }))
              }
            >
              <Picker.Item label="Tümü" value={-1} />
              <Picker.Item label="Öğrenci" value={KullaniciTipi.OGRENCI} />
              <Picker.Item
                label="Akademisyen"
                value={KullaniciTipi.AKADEMISYEN}
              />
              <Picker.Item label="Personel" value={KullaniciTipi.PERSONEL} />
            </Picker>
          </View>
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Ad</Text>
          <TextInput
            style={styles.filterInput}
            value={searchFilters.ad}
            onChangeText={(text) =>
              setSearchFilters((prev) => ({ ...prev, ad: text }))
            }
            placeholder="Ad ara..."
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Soyad</Text>
          <TextInput
            style={styles.filterInput}
            value={searchFilters.soyad}
            onChangeText={(text) =>
              setSearchFilters((prev) => ({ ...prev, soyad: text }))
            }
            placeholder="Soyad ara..."
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Sicil No</Text>
          <TextInput
            style={styles.filterInput}
            value={searchFilters.kurumSicilNo}
            onChangeText={(text) =>
              setSearchFilters((prev) => ({ ...prev, kurumSicilNo: text }))
            }
            placeholder="Sicil no ara..."
          />
        </View>

        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <IconSymbol name="magnifyingglass" size={16} color="#fff" />
          <Text style={styles.searchButtonText}>Ara</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderUserList = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.title}>Kullanıcı Yönetimi</Text>
        <View style={styles.headerButtons}>
          <Pressable style={styles.refreshButton} onPress={handleRefresh}>
            <IconSymbol name="arrow.clockwise" size={16} color="#666" />
            <Text style={styles.refreshButtonText}>Yenile</Text>
          </Pressable>
          <Pressable
            style={styles.addButton}
            onPress={() => handleViewModeChange("new")}
          >
            <IconSymbol name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Yeni Kullanıcı</Text>
          </Pressable>
        </View>
      </View>

      {renderSearchFilters()}

      {loading && (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      )}

      <ScrollView style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colName]}>Ad Soyad</Text>
          <Text style={[styles.tableHeaderText, styles.colEmail]}>E-posta</Text>
          <Text style={[styles.tableHeaderText, styles.colSicil]}>
            Sicil No
          </Text>
          <Text style={[styles.tableHeaderText, styles.colType]}>Tür</Text>
          <Text style={[styles.tableHeaderText, styles.colActions]}>
            İşlemler
          </Text>
        </View>

        {users.map((user, index) => (
          <View
            key={user.kullaniciUuid}
            style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
          >
            <Text style={[styles.tableCell, styles.colName]}>
              {`${user.ad || ""} ${user.ortaAd || ""} ${user.soyad || ""}`.trim() ||
                "-"}
            </Text>
            <Text style={[styles.tableCell, styles.colEmail]}>
              {user.kurumEposta}
            </Text>
            <Text style={[styles.tableCell, styles.colSicil]}>
              {user.kurumSicilNo}
            </Text>
            <Text style={[styles.tableCell, styles.colType]}>
              {getUserTypeLabel(user.kullaniciTipi)}
            </Text>
            <View style={[styles.tableCellActions, styles.colActions]}>
              <Pressable
                style={styles.editButton}
                onPress={() => handleViewModeChange("edit", user)}
              >
                <IconSymbol name="pencil" size={14} color="#007AFF" />
                <Text style={styles.actionButtonText}>Düzenle</Text>
              </Pressable>
              <Pressable
                style={styles.deleteButton}
                onPress={() => {
                  handleDeleteUser(user);
                }}
              >
                <IconSymbol name="trash" size={14} color="#FF3B30" />
                <Text style={styles.actionButtonText}>Sil</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {users.length === 0 && !loading && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Kullanıcı bulunamadı</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.pagination}>
        <Text style={styles.paginationText}>
          Toplam {totalUsers} kullanıcı - Sayfa {currentPage}
          {totalUsers > 0 && ` / ${Math.ceil(totalUsers / pageSize) || 1}`}
        </Text>
        <View style={styles.paginationButtons}>
          <Pressable
            style={[
              styles.pageButton,
              currentPage <= 1 && styles.pageButtonDisabled,
            ]}
            disabled={currentPage <= 1}
            onPress={() => loadUsers(currentPage - 1, searchFilters)}
          >
            <Text
              style={[
                styles.pageButtonText,
                currentPage <= 1 && styles.disabledButtonText,
              ]}
            >
              Önceki
            </Text>
          </Pressable>

          <Text style={styles.currentPageText}>{currentPage}</Text>

          <Pressable
            style={[styles.pageButton, isLastPage && styles.pageButtonDisabled]}
            disabled={isLastPage}
            onPress={() => loadUsers(currentPage + 1, searchFilters)}
          >
            <Text
              style={[
                styles.pageButtonText,
                isLastPage && styles.disabledButtonText,
              ]}
            >
              Sonraki
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderUserForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Pressable
          style={styles.backButton}
          onPress={() => handleViewModeChange("list")}
        >
          <IconSymbol name="arrow.left" size={16} color="#007AFF" />
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </Pressable>
        <Text style={styles.title}>
          {viewMode === "new" ? "Yeni Kullanıcı" : "Kullanıcı Düzenle"}
        </Text>
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
      >
        <View style={styles.formGrid}>
          <View style={styles.formRow}>
            <Text style={styles.label}>Kullanıcı Tipi *</Text>
            <View
              style={[
                styles.pickerContainer,
                formErrors.kullaniciTipi && styles.errorInput,
              ]}
            >
              <Picker
                selectedValue={formData.kullaniciTipi}
                style={styles.picker}
                onValueChange={(itemValue) => {
                  const patterns = getDefaultPatterns(itemValue);
                  setFormData((prev) => ({
                    ...prev,
                    kullaniciTipi: itemValue,
                    kurumEposta: patterns.kurumEposta,
                    kurumSicilNo: patterns.kurumSicilNo,
                  }));
                }}
              >
                <Picker.Item
                  label={getUserTypeLabel(KullaniciTipi.OGRENCI)}
                  value={KullaniciTipi.OGRENCI}
                />
                <Picker.Item
                  label={getUserTypeLabel(KullaniciTipi.AKADEMISYEN)}
                  value={KullaniciTipi.AKADEMISYEN}
                />
                <Picker.Item
                  label={getUserTypeLabel(KullaniciTipi.PERSONEL)}
                  value={KullaniciTipi.PERSONEL}
                />
              </Picker>
            </View>
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Ad</Text>
            <TextInput
              style={[styles.input, formErrors.ad && styles.errorInput]}
              value={formData.ad}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, ad: text }))
              }
              placeholder="Adınızı giriniz"
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Orta Ad</Text>
            <TextInput
              style={[styles.input, formErrors.ortaAd && styles.errorInput]}
              value={formData.ortaAd}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, ortaAd: text }))
              }
              placeholder="Orta adınızı giriniz"
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Soyad</Text>
            <TextInput
              style={[styles.input, formErrors.soyad && styles.errorInput]}
              value={formData.soyad}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, soyad: text }))
              }
              placeholder="Soyadınızı giriniz"
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Kurum E-posta *</Text>
            <TextInput
              style={[
                styles.input,
                formErrors.kurumEposta && styles.errorInput,
              ]}
              value={formData.kurumEposta}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, kurumEposta: text }))
              }
              placeholder="@ahievran.edu.tr ile biten e-posta"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {formErrors.kurumEposta && (
              <Text style={styles.errorText}>
                Geçerli bir @ahievran.edu.tr e-posta adresi giriniz
              </Text>
            )}
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Kurum Sicil No *</Text>
            <TextInput
              style={[
                styles.input,
                formErrors.kurumSicilNo && styles.errorInput,
              ]}
              value={formData.kurumSicilNo}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, kurumSicilNo: text }))
              }
              placeholder="Geçerli sicil numarası giriniz"
            />
            {formErrors.kurumSicilNo && (
              <Text style={styles.errorText}>
                Varsayılan sicil numarasını değiştirmelisiniz
              </Text>
            )}
          </View>
        </View>

        <View style={styles.formActions}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => handleViewModeChange("list")}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </Pressable>
          <Pressable
            style={[
              styles.saveButton,
              (!isFormValid() || loading) && styles.saveButtonDisabled,
            ]}
            onPress={viewMode === "new" ? handleCreateUser : handleUpdateUser}
            disabled={!isFormValid() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={[
                  styles.saveButtonText,
                  (!isFormValid() || loading) && styles.disabledButtonText,
                ]}
              >
                {viewMode === "new" ? "Oluştur" : "Güncelle"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <NavigationBar userName="Kullanıcı" />
      <View style={styles.mainContent}>
        {isAdmin && (
          <>
            <AdminSidePanel
              userName="Admin Kullanıcı"
              isCollapsed={isPanelCollapsed}
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
                name={isPanelCollapsed ? "chevron.right" : "chevron.down"}
                size={18}
                color="#666"
              />
            </Pressable>
          </>
        )}

        <View style={styles.content}>
          {viewMode === "list" ? renderUserList() : renderUserForm()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  // Search and Filter styles
  searchContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  filterItem: {
    flex: 1,
    minWidth: 150,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 4,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#fff",
    height: 40,
  },
  smallPickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    backgroundColor: "#fff",
    height: 40,
  },
  smallPicker: {
    height: 40,
    fontSize: 14,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
    height: 40,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // List styles
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#181818",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  refreshButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loader: {
    marginVertical: 20,
  },
  // Table styles
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#343a40",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    minHeight: 50,
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#fafafa",
  },
  tableCell: {
    fontSize: 14,
    color: "#495057",
    textAlignVertical: "center",
  },
  tableCellActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  colName: { flex: 1.9, paddingHorizontal: 12 },
  colEmail: { flex: 1.9, paddingHorizontal: 8 },
  colSicil: { flex: 0.95, paddingHorizontal: 8 },
  colType: { flex: 0.76, paddingHorizontal: 8 },
  colActions: { flex: 1.43, paddingHorizontal: 8 },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#e3f2fd",
    gap: 4,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#ffebee",
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  noDataContainer: {
    padding: 40,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  // Pagination styles
  pagination: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paginationText: {
    fontSize: 14,
    color: "#666",
  },
  paginationButtons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#007AFF",
    minWidth: 80,
    alignItems: "center",
  },
  pageButtonDisabled: {
    backgroundColor: "#ccc",
  },
  pageButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  disabledButtonText: {
    color: "#999",
  },
  currentPageText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginHorizontal: 8,
  },
  // Form styles
  formContainer: {
    flex: 1,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    gap: 8,
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  form: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 40,
  },
  formGrid: {
    maxWidth: "70%", // Reduced width as requested
    alignSelf: "center",
    width: "100%",
  },
  formRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 48,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    minHeight: 48,
    justifyContent: "center",
  },
  picker: {
    height: 48,
    fontSize: 16,
  },
  errorInput: {
    borderColor: "#FF3B30",
    borderWidth: 2,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    maxWidth: "70%",
    alignSelf: "center",
    width: "100%",
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    minWidth: 100,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Toggle button styles (from other components)
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

export default UserManagement;
