import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { ROUTES } from "../../../app/router";
import NavigationBar from "../../../components/panels/navigation-panels/navigation-bar";
import AdminSidePanel from "../../../components/panels/side-panels/admin-side-panel";
import { FacultyTexts } from "../../../components/texts/faculty-texts";
import { IconSymbol } from "../../../components/ui/icon-symbol";
import Loading from "../../../components/ui/loading";
import { Tooltip } from "../../../components/ui/tooltip";
import { IdentityType } from "../../../constants/identity-types";
import {
    Faculty,
    FacultyCreateRequest,
    FacultyUpdateRequest,
    facultyAPI,
} from "../../../services/faculty-api";
import { getCookie } from "../../../utils/cookies";
import { getIdentityTypeFromToken } from "../../../utils/jwt";

type ViewMode = "list" | "new" | "edit" | "view";

const validateForm = (formData: any) => {
  const errors: { [key: string]: boolean } = {};

  if (!formData.fakulteAdi || formData.fakulteAdi.trim().length < 2) {
    errors.fakulteAdi = true;
  }

  return errors;
};

const FacultyManagement: React.FC = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [identityType, setIdentityType] = useState<IdentityType | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState({
    fakulteAdi: "",
    webAdres: "",
    kurulusTarihi: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalFaculties, setTotalFaculties] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);

  const [searchFilters, setSearchFilters] = useState({
    fakulteAdi: "",
    webAdres: "",
  });

  const [copyTooltip, setCopyTooltip] = useState<{
    visible: boolean;
    text: string;
  }>({ visible: false, text: "" });

  useEffect(() => {
    const t = setTimeout(() => {
      const token = getCookie("accessToken");
      if (!token) {
        router.replace(ROUTES.LOGIN as any);
      } else {
        const userIdentityType = getIdentityTypeFromToken(token);
        setIdentityType(userIdentityType);
        setIsChecking(false);
        loadFaculties();
      }
    }, 100);
    return () => clearTimeout(t);
  }, [router]);

  useEffect(() => {
    const errors = validateForm(formData);
    setFormErrors(errors);
  }, [formData]);

  const loadFaculties = async (page = currentPage, filters = searchFilters) => {
    try {
      setLoading(true);
      const response = await facultyAPI.getFaculties({
        page,
        pageSize,
        ...filters,
      });
      const data = response.data || [];
      setFaculties(data);
      setTotalFaculties(response.total || 0);
      setCurrentPage(page);
      setIsLastPage(data.length < pageSize);
    } catch (error: any) {
      setFaculties([]);
      setTotalFaculties(0);
      setIsLastPage(true);
      Alert.alert(
        FacultyTexts.errors.general,
        error.message || FacultyTexts.errors.loadFacultiesError,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setFaculties([]);
    loadFaculties(currentPage, searchFilters);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setIsLastPage(false);
    loadFaculties(1, searchFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = { fakulteAdi: "", webAdres: "" };
    setSearchFilters(defaultFilters);
    setCurrentPage(1);
    setIsLastPage(false);
    loadFaculties(1, defaultFilters);
  };

  const handleViewModeChange = (mode: ViewMode, faculty?: Faculty) => {
    setViewMode(mode);
    if ((mode === "edit" || mode === "view") && faculty) {
      setEditingFaculty(faculty);
      if (mode === "edit") {
        setFormData({
          fakulteAdi: faculty.fakulteAdi,
          webAdres: faculty.webAdres || "",
          kurulusTarihi: faculty.kurulusTarihi || "",
        });
      }
    } else if (mode === "new") {
      setEditingFaculty(null);
      setFormData({ fakulteAdi: "", webAdres: "", kurulusTarihi: "" });
    }
    setFormErrors({});
  };

  const isFormValid = () => {
    const errors = validateForm(formData);
    return Object.keys(errors).length === 0;
  };

  const handleCreateFaculty = async () => {
    if (!isFormValid()) {
      Alert.alert(
        FacultyTexts.errors.general,
        FacultyTexts.errors.fillAllFields,
      );
      return;
    }

    try {
      setLoading(true);
      const createData: FacultyCreateRequest = {
        fakulteAdi: formData.fakulteAdi.trim(),
        webAdres: formData.webAdres.trim() || null,
        kurulusTarihi: formData.kurulusTarihi.trim() || null,
      };
      await facultyAPI.createFaculty(createData);
      Alert.alert("Başarılı", FacultyTexts.success.facultyCreated);
      setViewMode("list");
      loadFaculties();
    } catch (error: any) {
      setCopyTooltip({
        visible: true,
        text: error.message || FacultyTexts.errors.createFacultyError,
      });
      setTimeout(() => setCopyTooltip({ visible: false, text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFaculty = async () => {
    if (!isFormValid()) {
      Alert.alert(
        FacultyTexts.errors.general,
        FacultyTexts.errors.fillAllFields,
      );
      return;
    }

    if (!editingFaculty) {
      Alert.alert(
        FacultyTexts.errors.general,
        FacultyTexts.errors.facultyNotFoundForEdit,
      );
      return;
    }

    try {
      setLoading(true);
      const updateData: FacultyUpdateRequest = {
        fakulteUuid: editingFaculty.fakulteUuid,
        fakulteAdi: formData.fakulteAdi.trim(),
        webAdres: formData.webAdres.trim() || null,
        kurulusTarihi: formData.kurulusTarihi.trim() || null,
      };
      await facultyAPI.updateFaculty(updateData);
      Alert.alert("Başarılı", FacultyTexts.success.facultyUpdated);
      setViewMode("list");
      loadFaculties();
    } catch (error: any) {
      setCopyTooltip({
        visible: true,
        text: error.message || FacultyTexts.errors.updateFacultyError,
      });
      setTimeout(() => setCopyTooltip({ visible: false, text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (faculty: Faculty) => {
    try {
      setLoading(true);
      await facultyAPI.deleteFaculty(faculty.fakulteUuid);
      await loadFaculties(currentPage, searchFilters);
      Alert.alert("Başarılı", FacultyTexts.success.facultyDeleted);
    } catch (error: any) {
      Alert.alert(
        "Silme İşlemi Başarısız",
        error.message || FacultyTexts.errors.deleteFacultyError,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    setCopyTooltip({ visible: true, text: FacultyTexts.copy(label) });
    setTimeout(() => setCopyTooltip({ visible: false, text: "" }), 2000);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("tr-TR");
    } catch {
      return dateStr;
    }
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <Loading text={FacultyTexts.messages.loading} />
      </View>
    );
  }

  const isAdmin = identityType === IdentityType.PERSONEL;

  const renderSearchFilters = () => (
    <View style={styles.searchContainer}>
      <Text style={styles.searchTitle}>{FacultyTexts.search.filtersTitle}</Text>
      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Fakülte Adı</Text>
          <TextInput
            style={styles.filterInput}
            value={searchFilters.fakulteAdi}
            onChangeText={(text) =>
              setSearchFilters((prev) => ({ ...prev, fakulteAdi: text }))
            }
            placeholder={FacultyTexts.placeholders.searchName}
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Web Adresi</Text>
          <TextInput
            style={styles.filterInput}
            value={searchFilters.webAdres}
            onChangeText={(text) =>
              setSearchFilters((prev) => ({ ...prev, webAdres: text }))
            }
            placeholder={FacultyTexts.placeholders.searchWebAddress}
          />
        </View>

        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <IconSymbol name="magnifyingglass" size={16} color="#fff" />
          <Text style={styles.searchButtonText}>
            {FacultyTexts.search.searchButton}
          </Text>
        </Pressable>

        <Pressable style={styles.clearButton} onPress={handleClearFilters}>
          <IconSymbol
            name="plus"
            size={16}
            color="#666"
            style={{ transform: [{ rotate: "45deg" }] }}
          />
          <Text style={styles.clearButtonText}>Temizle</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderFacultyList = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.title}>{FacultyTexts.pageTitle}</Text>
        <View style={styles.headerButtons}>
          <Pressable style={styles.refreshButton} onPress={handleRefresh}>
            <IconSymbol name="arrow.clockwise" size={16} color="#666" />
            <Text style={styles.refreshButtonText}>
              {FacultyTexts.search.refreshButton}
            </Text>
          </Pressable>
          <Pressable
            style={styles.addButton}
            onPress={() => handleViewModeChange("new")}
          >
            <IconSymbol name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>
              {FacultyTexts.search.addButton}
            </Text>
          </Pressable>
        </View>
      </View>

      {renderSearchFilters()}

      {loading && (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      )}

      <View style={styles.tableContainer}>
        <View
          style={[
            styles.tableHeader,
            { position: "sticky", top: 0, zIndex: 10 },
          ]}
        >
          <Text style={[styles.tableHeaderText, styles.colName]}>
            {FacultyTexts.table.name}
          </Text>
          <Text style={[styles.tableHeaderText, styles.colWeb]}>
            {FacultyTexts.table.webAddress}
          </Text>
          <Text style={[styles.tableHeaderText, styles.colDate]}>
            {FacultyTexts.table.foundedDate}
          </Text>
          <Text style={[styles.tableHeaderText, styles.colActions]}>
            {FacultyTexts.table.actions}
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {Array.isArray(faculties) &&
            faculties.map((faculty, index) => (
              <View
                key={faculty.fakulteUuid}
                style={[
                  styles.tableRow,
                  index % 2 === 0 && styles.tableRowEven,
                ]}
              >
                <View style={styles.colName}>
                  <View style={styles.nameCellContainer}>
                    <Text style={styles.tableCell}>{faculty.fakulteAdi}</Text>
                    <Pressable
                      style={styles.copyButton}
                      onPress={() =>
                        handleCopyToClipboard(faculty.fakulteAdi, "Fakülte Adı")
                      }
                    >
                      <IconSymbol name="copy" size={12} color="#007AFF" />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.colWeb}>
                  {faculty.webAdres ? (
                    <View style={styles.nameCellContainer}>
                      <Pressable
                        onPress={() =>
                          Linking.openURL(
                            faculty.webAdres!.startsWith("http")
                              ? faculty.webAdres!
                              : `https://${faculty.webAdres}`,
                          )
                        }
                      >
                        <Text style={[styles.tableCell, styles.linkText]}>
                          {faculty.webAdres}
                        </Text>
                      </Pressable>
                      <Pressable
                        style={styles.copyButton}
                        onPress={() =>
                          handleCopyToClipboard(
                            faculty.webAdres!.startsWith("http")
                              ? faculty.webAdres!
                              : `https://${faculty.webAdres}`,
                            "Web Adresi",
                          )
                        }
                      >
                        <IconSymbol name="copy" size={12} color="#007AFF" />
                      </Pressable>
                    </View>
                  ) : (
                    <Text style={styles.tableCell}>-</Text>
                  )}
                </View>

                <View style={styles.colDate}>
                  <Text style={styles.tableCell}>
                    {formatDate(faculty.kurulusTarihi)}
                  </Text>
                </View>

                <View style={styles.colActions}>
                  <View style={styles.tableCellActions}>
                    <Pressable
                      style={styles.editButton}
                      onPress={() => handleViewModeChange("edit", faculty)}
                    >
                      <IconSymbol name="pencil" size={12} color="#007AFF" />
                      <Text
                        style={[styles.actionButtonText, { color: "#007AFF" }]}
                      >
                        {FacultyTexts.actions.edit}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.viewButton}
                      onPress={() => handleViewModeChange("view", faculty)}
                    >
                      <IconSymbol
                        name="magnifyingglass"
                        size={12}
                        color="#34C759"
                      />
                      <Text style={styles.viewButtonText}>
                        {FacultyTexts.actions.view}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => {
                        Alert.alert(
                          "Silme Onayı",
                          `"${faculty.fakulteAdi}" fakültesini silmek istediğinizden emin misiniz?`,
                          [
                            { text: "İptal", style: "cancel" },
                            {
                              text: "Sil",
                              style: "destructive",
                              onPress: () => handleDeleteFaculty(faculty),
                            },
                          ],
                        );
                      }}
                    >
                      <IconSymbol name="trash" size={12} color="#FF3B30" />
                      <Text
                        style={[styles.actionButtonText, { color: "#FF3B30" }]}
                      >
                        {FacultyTexts.actions.delete}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}

          {(!Array.isArray(faculties) || faculties.length === 0) &&
            !loading && (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  {FacultyTexts.messages.noData}
                </Text>
              </View>
            )}
        </ScrollView>
      </View>

      <View style={styles.pagination}>
        <Text style={styles.paginationText}>
          {FacultyTexts.messages.totalFaculties(totalFaculties, currentPage)}
          {totalFaculties > 0 &&
            ` / ${Math.ceil(totalFaculties / pageSize) || 1}`}
        </Text>
        <View style={styles.paginationButtons}>
          <Pressable
            style={[
              styles.pageButton,
              currentPage <= 1 && styles.pageButtonDisabled,
            ]}
            disabled={currentPage <= 1}
            onPress={() => loadFaculties(currentPage - 1, searchFilters)}
          >
            <Text
              style={[
                styles.pageButtonText,
                currentPage <= 1 && styles.disabledButtonText,
              ]}
            >
              {FacultyTexts.actions.previous}
            </Text>
          </Pressable>

          <Text style={styles.currentPageText}>{currentPage}</Text>

          <Pressable
            style={[styles.pageButton, isLastPage && styles.pageButtonDisabled]}
            disabled={isLastPage}
            onPress={() => loadFaculties(currentPage + 1, searchFilters)}
          >
            <Text
              style={[
                styles.pageButtonText,
                isLastPage && styles.disabledButtonText,
              ]}
            >
              {FacultyTexts.actions.next}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderFacultyForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Pressable
          style={styles.backButton}
          onPress={() => handleViewModeChange("list")}
        >
          <IconSymbol name="arrow.left" size={16} color="#007AFF" />
          <Text style={styles.backButtonText}>
            {FacultyTexts.search.backButton}
          </Text>
        </Pressable>
        <Text style={styles.title}>
          {viewMode === "new"
            ? FacultyTexts.newFacultyTitle
            : FacultyTexts.editFacultyTitle}
        </Text>
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
      >
        <View style={styles.formGrid}>
          <View style={styles.formRow}>
            <Text style={styles.label}>{FacultyTexts.labels.facultyName}</Text>
            <TextInput
              style={[styles.input, formErrors.fakulteAdi && styles.errorInput]}
              value={formData.fakulteAdi}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, fakulteAdi: text }))
              }
              placeholder={FacultyTexts.placeholders.enterName}
            />
            {formErrors.fakulteAdi && (
              <Text style={styles.errorText}>
                {FacultyTexts.validation.nameMin}
              </Text>
            )}
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>{FacultyTexts.labels.webAddress}</Text>
            <TextInput
              style={styles.input}
              value={formData.webAdres}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, webAdres: text }))
              }
              placeholder={FacultyTexts.placeholders.enterWebAddress}
              keyboardType="url"
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>{FacultyTexts.labels.foundedDate}</Text>
            <TextInput
              style={styles.input}
              value={formData.kurulusTarihi}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, kurulusTarihi: text }))
              }
              placeholder={FacultyTexts.placeholders.enterFoundedDate}
            />
          </View>
        </View>

        <View style={styles.formActions}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => handleViewModeChange("list")}
          >
            <Text style={styles.cancelButtonText}>
              {FacultyTexts.actions.cancel}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.saveButton,
              !isFormValid() && styles.saveButtonDisabled,
            ]}
            disabled={!isFormValid()}
            onPress={
              viewMode === "new" ? handleCreateFaculty : handleUpdateFaculty
            }
          >
            <Text style={styles.saveButtonText}>
              {viewMode === "new"
                ? FacultyTexts.actions.create
                : FacultyTexts.actions.update}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );

  const renderFacultyView = () => {
    if (!editingFaculty) {
      return (
        <View style={styles.formContainer}>
          <Text>Fakülte bulunamadı</Text>
        </View>
      );
    }

    return (
      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Pressable
            style={styles.backButton}
            onPress={() => handleViewModeChange("list")}
          >
            <IconSymbol name="arrow.left" size={16} color="#007AFF" />
            <Text style={styles.backButtonText}>
              {FacultyTexts.search.backButton}
            </Text>
          </Pressable>
          <Text style={styles.title}>{FacultyTexts.facultyInfoTitle}</Text>
        </View>

        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
        >
          <View style={styles.profileSectionsContainer}>
            <Text style={styles.profileSubtitle}>
              Fakültenin detaylı bilgilerini görüntüleyin
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Temel Bilgiler</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{FacultyTexts.labels.name}</Text>
                <View style={styles.copyableRow}>
                  <Text style={styles.infoValue}>
                    {editingFaculty.fakulteAdi}
                  </Text>
                  <Pressable
                    style={styles.copyButton}
                    onPress={() =>
                      handleCopyToClipboard(
                        editingFaculty.fakulteAdi,
                        "Fakülte Adı",
                      )
                    }
                  >
                    <IconSymbol name="copy" size={12} color="#007AFF" />
                  </Pressable>
                </View>
              </View>

              {editingFaculty.webAdres && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    {FacultyTexts.labels.web}
                  </Text>
                  <View style={styles.copyableRow}>
                    <Pressable
                      onPress={() =>
                        Linking.openURL(
                          editingFaculty.webAdres!.startsWith("http")
                            ? editingFaculty.webAdres!
                            : `https://${editingFaculty.webAdres}`,
                        )
                      }
                    >
                      <Text style={[styles.infoValue, styles.linkText]}>
                        {editingFaculty.webAdres}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.copyButton}
                      onPress={() =>
                        handleCopyToClipboard(
                          editingFaculty.webAdres!.startsWith("http")
                            ? editingFaculty.webAdres!
                            : `https://${editingFaculty.webAdres}`,
                          "Web Adresi",
                        )
                      }
                    >
                      <IconSymbol name="copy" size={12} color="#007AFF" />
                    </Pressable>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {FacultyTexts.labels.founded}
                </Text>
                <Text style={styles.infoValue}>
                  {formatDate(editingFaculty.kurulusTarihi)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <NavigationBar userName="Fakülte" />
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

        <View style={styles.content}>
          {viewMode === "list" && renderFacultyList()}
          {(viewMode === "new" || viewMode === "edit") && renderFacultyForm()}
          {viewMode === "view" && renderFacultyView()}
        </View>
      </View>

      <Tooltip
        visible={copyTooltip.visible}
        text={copyTooltip.text}
        position="top"
      />
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
    marginHorizontal: "2%",
  },
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
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  clearButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
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
    fontWeight: "500",
  },
  tableCellActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  colName: { flex: 2.0, paddingHorizontal: 12 },
  colWeb: { flex: 2.0, paddingHorizontal: 8 },
  colDate: { flex: 1.2, paddingHorizontal: 8 },
  colActions: { flex: 2.0, paddingHorizontal: 8 },
  nameCellContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: "#bbdefb",
    minWidth: 24,
    minHeight: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#e3f2fd",
    gap: 4,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#e8f5e8",
    gap: 4,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#34C759",
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
  linkText: {
    color: "#007AFF",
    textDecorationLine: "underline",
  },
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
    maxWidth: "70%",
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
  profileSectionsContainer: {
    maxWidth: "90%",
    alignSelf: "center",
    width: "100%",
  },
  profileSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    minWidth: 90,
    marginRight: 12,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  copyableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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

export default FacultyManagement;
