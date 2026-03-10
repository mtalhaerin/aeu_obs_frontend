import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
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
import { MinorTexts } from "../../../components/texts/minor-texts";
import { IconSymbol } from "../../../components/ui/icon-symbol";
import Loading from "../../../components/ui/loading";
import { Tooltip } from "../../../components/ui/tooltip";
import { IdentityType } from "../../../constants/identity-types";
import { Major, majorAPI } from "../../../services/major-api";
import {
  Minor,
  MinorCreateRequest,
  MinorUpdateRequest,
  minorAPI,
} from "../../../services/minor-api";
import { getCookie } from "../../../utils/cookies";
import { getIdentityTypeFromToken } from "../../../utils/jwt";

type ViewMode = "list" | "new" | "edit" | "view";

const validateForm = (formData: any) => {
  const errors: { [key: string]: boolean } = {};

  if (!formData.anaDalAdi || formData.anaDalAdi.trim().length < 2) {
    errors.anaDalAdi = true;
  }

  if (!formData.bolumUuid || formData.bolumUuid.trim() === "") {
    errors.bolumUuid = true;
  }

  return errors;
};

const MinorManagement: React.FC = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [identityType, setIdentityType] = useState<IdentityType | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const [minors, setMinors] = useState<Minor[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMinor, setEditingMinor] = useState<Minor | null>(null);

  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState({
    anaDalAdi: "",
    bolumUuid: "",
    kurulusTarihi: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalMinors, setTotalMinors] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);

  const [searchFilters, setSearchFilters] = useState({
    anaDalAdi: "",
    bolumUuid: "",
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
        loadMinors();
        loadMajors();
      }
    }, 100);
    return () => clearTimeout(t);
  }, [router]);

  useEffect(() => {
    const errors = validateForm(formData);
    setFormErrors(errors);
  }, [formData]);

  const loadMajors = async () => {
    try {
      const response = await majorAPI.getMajors({ pageSize: 200 });
      setMajors(response.data || []);
    } catch {
      setMajors([]);
    }
  };

  const getMajorName = (bolumUuid: string) => {
    const major = majors.find((m) => m.bolumUuid === bolumUuid);
    return major ? major.bolumAdi : bolumUuid;
  };

  const loadMinors = async (page = currentPage, filters = searchFilters) => {
    try {
      setLoading(true);
      const response = await minorAPI.getMinors({
        page,
        pageSize,
        ...filters,
      });
      const data = response.data || [];
      setMinors(data);
      setTotalMinors(response.total || 0);
      setCurrentPage(page);
      setIsLastPage(data.length < pageSize);
    } catch (error: any) {
      setMinors([]);
      setTotalMinors(0);
      setIsLastPage(true);
      Alert.alert(
        MinorTexts.errors.general,
        error.message || MinorTexts.errors.loadMinorsError,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setMinors([]);
    loadMinors(currentPage, searchFilters);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setIsLastPage(false);
    loadMinors(1, searchFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = { anaDalAdi: "", bolumUuid: "" };
    setSearchFilters(defaultFilters);
    setCurrentPage(1);
    setIsLastPage(false);
    loadMinors(1, defaultFilters);
  };

  const handleViewModeChange = (mode: ViewMode, minor?: Minor) => {
    setViewMode(mode);
    if ((mode === "edit" || mode === "view") && minor) {
      setEditingMinor(minor);
      if (mode === "edit") {
        setFormData({
          anaDalAdi: minor.anaDalAdi,
          bolumUuid: minor.bolumUuid,
          kurulusTarihi: minor.kurulusTarihi || "",
        });
      }
    } else if (mode === "new") {
      setEditingMinor(null);
      setFormData({ anaDalAdi: "", bolumUuid: "", kurulusTarihi: "" });
    }
    setFormErrors({});
  };

  const isFormValid = () => {
    const errors = validateForm(formData);
    return Object.keys(errors).length === 0;
  };

  const handleCreateMinor = async () => {
    if (!isFormValid()) {
      Alert.alert(MinorTexts.errors.general, MinorTexts.errors.fillAllFields);
      return;
    }

    try {
      setLoading(true);
      const createData: MinorCreateRequest = {
        anaDalAdi: formData.anaDalAdi.trim(),
        bolumUuid: formData.bolumUuid,
        kurulusTarihi: formData.kurulusTarihi.trim() || null,
      };
      await minorAPI.createMinor(createData);
      Alert.alert("Başarılı", MinorTexts.success.minorCreated);
      setViewMode("list");
      loadMinors();
    } catch (error: any) {
      setCopyTooltip({
        visible: true,
        text: error.message || MinorTexts.errors.createMinorError,
      });
      setTimeout(() => setCopyTooltip({ visible: false, text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMinor = async () => {
    if (!isFormValid()) {
      Alert.alert(MinorTexts.errors.general, MinorTexts.errors.fillAllFields);
      return;
    }

    if (!editingMinor) {
      Alert.alert(
        MinorTexts.errors.general,
        MinorTexts.errors.minorNotFoundForEdit,
      );
      return;
    }

    try {
      setLoading(true);
      const updateData: MinorUpdateRequest = {
        anaDalUuid: editingMinor.anaDalUuid,
        anaDalAdi: formData.anaDalAdi.trim(),
        bolumUuid: formData.bolumUuid,
        kurulusTarihi: formData.kurulusTarihi.trim() || null,
      };
      await minorAPI.updateMinor(updateData);
      Alert.alert("Başarılı", MinorTexts.success.minorUpdated);
      setViewMode("list");
      loadMinors();
    } catch (error: any) {
      setCopyTooltip({
        visible: true,
        text: error.message || MinorTexts.errors.updateMinorError,
      });
      setTimeout(() => setCopyTooltip({ visible: false, text: "" }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMinor = async (minor: Minor) => {
    try {
      setLoading(true);
      await minorAPI.deleteMinor(minor.anaDalUuid);
      await loadMinors(currentPage, searchFilters);
      Alert.alert("Başarılı", MinorTexts.success.minorDeleted);
    } catch (error: any) {
      Alert.alert(
        "Silme İşlemi Başarısız",
        error.message || MinorTexts.errors.deleteMinorError,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    setCopyTooltip({ visible: true, text: MinorTexts.copy(label) });
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
        <Loading text={MinorTexts.messages.loading} />
      </View>
    );
  }

  const isAdmin = identityType === IdentityType.PERSONEL;

  const renderSearchFilters = () => (
    <View style={styles.searchContainer}>
      <Text style={styles.searchTitle}>{MinorTexts.search.filtersTitle}</Text>
      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Ana Dal Adı</Text>
          <TextInput
            style={styles.filterInput}
            value={searchFilters.anaDalAdi}
            onChangeText={(text) =>
              setSearchFilters((prev) => ({ ...prev, anaDalAdi: text }))
            }
            placeholder={MinorTexts.placeholders.searchName}
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Bölüm</Text>
          <View style={styles.filterPickerContainer}>
            <Picker
              selectedValue={searchFilters.bolumUuid}
              style={styles.filterPicker}
              onValueChange={(value) =>
                setSearchFilters((prev) => ({ ...prev, bolumUuid: value }))
              }
            >
              <Picker.Item label="Tümü" value="" />
              {majors.map((major) => (
                <Picker.Item
                  key={major.bolumUuid}
                  label={major.bolumAdi}
                  value={major.bolumUuid}
                />
              ))}
            </Picker>
          </View>
        </View>

        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <IconSymbol name="magnifyingglass" size={16} color="#fff" />
          <Text style={styles.searchButtonText}>
            {MinorTexts.search.searchButton}
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

  const renderMinorList = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.title}>{MinorTexts.pageTitle}</Text>
        <View style={styles.headerButtons}>
          <Pressable style={styles.refreshButton} onPress={handleRefresh}>
            <IconSymbol name="arrow.clockwise" size={16} color="#666" />
            <Text style={styles.refreshButtonText}>
              {MinorTexts.search.refreshButton}
            </Text>
          </Pressable>
          <Pressable
            style={styles.addButton}
            onPress={() => handleViewModeChange("new")}
          >
            <IconSymbol name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>
              {MinorTexts.search.addButton}
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
            {MinorTexts.table.name}
          </Text>
          <Text style={[styles.tableHeaderText, styles.colMajor]}>
            {MinorTexts.table.major}
          </Text>
          <Text style={[styles.tableHeaderText, styles.colDate]}>
            {MinorTexts.table.foundedDate}
          </Text>
          <Text style={[styles.tableHeaderText, styles.colActions]}>
            {MinorTexts.table.actions}
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {Array.isArray(minors) &&
            minors.map((minor, index) => (
              <View
                key={minor.anaDalUuid}
                style={[
                  styles.tableRow,
                  index % 2 === 0 && styles.tableRowEven,
                ]}
              >
                <View style={styles.colName}>
                  <View style={styles.nameCellContainer}>
                    <Text style={styles.tableCell}>{minor.anaDalAdi}</Text>
                    <Pressable
                      style={styles.copyButton}
                      onPress={() =>
                        handleCopyToClipboard(minor.anaDalAdi, "Ana Dal Adı")
                      }
                    >
                      <IconSymbol name="copy" size={12} color="#007AFF" />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.colMajor}>
                  <Text style={styles.tableCell}>
                    {getMajorName(minor.bolumUuid)}
                  </Text>
                </View>

                <View style={styles.colDate}>
                  <Text style={styles.tableCell}>
                    {formatDate(minor.kurulusTarihi)}
                  </Text>
                </View>

                <View style={styles.colActions}>
                  <View style={styles.tableCellActions}>
                    <Pressable
                      style={styles.editButton}
                      onPress={() => handleViewModeChange("edit", minor)}
                    >
                      <IconSymbol name="pencil" size={12} color="#007AFF" />
                      <Text
                        style={[styles.actionButtonText, { color: "#007AFF" }]}
                      >
                        {MinorTexts.actions.edit}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.viewButton}
                      onPress={() => handleViewModeChange("view", minor)}
                    >
                      <IconSymbol
                        name="magnifyingglass"
                        size={12}
                        color="#34C759"
                      />
                      <Text style={styles.viewButtonText}>
                        {MinorTexts.actions.view}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => {
                        const message = `"${minor.anaDalAdi}" ana dalını silmek istediğinizden emin misiniz?`;
                        if (Platform.OS === "web") {
                          if (window.confirm(message)) {
                            handleDeleteMinor(minor);
                          }
                        } else {
                          Alert.alert("Silme Onayı", message, [
                            { text: "İptal", style: "cancel" },
                            {
                              text: "Sil",
                              style: "destructive",
                              onPress: () => handleDeleteMinor(minor),
                            },
                          ]);
                        }
                      }}
                    >
                      <IconSymbol name="trash" size={12} color="#FF3B30" />
                      <Text
                        style={[styles.actionButtonText, { color: "#FF3B30" }]}
                      >
                        {MinorTexts.actions.delete}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}

          {(!Array.isArray(minors) || minors.length === 0) && !loading && (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                {MinorTexts.messages.noData}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.pagination}>
        <Text style={styles.paginationText}>
          {MinorTexts.messages.totalMinors(totalMinors, currentPage)}
          {totalMinors > 0 && ` / ${Math.ceil(totalMinors / pageSize) || 1}`}
        </Text>
        <View style={styles.paginationButtons}>
          <Pressable
            style={[
              styles.pageButton,
              currentPage <= 1 && styles.pageButtonDisabled,
            ]}
            disabled={currentPage <= 1}
            onPress={() => loadMinors(currentPage - 1, searchFilters)}
          >
            <Text
              style={[
                styles.pageButtonText,
                currentPage <= 1 && styles.disabledButtonText,
              ]}
            >
              {MinorTexts.actions.previous}
            </Text>
          </Pressable>

          <Text style={styles.currentPageText}>{currentPage}</Text>

          <Pressable
            style={[styles.pageButton, isLastPage && styles.pageButtonDisabled]}
            disabled={isLastPage}
            onPress={() => loadMinors(currentPage + 1, searchFilters)}
          >
            <Text
              style={[
                styles.pageButtonText,
                isLastPage && styles.disabledButtonText,
              ]}
            >
              {MinorTexts.actions.next}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderMinorForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Pressable
          style={styles.backButton}
          onPress={() => handleViewModeChange("list")}
        >
          <IconSymbol name="arrow.left" size={16} color="#007AFF" />
          <Text style={styles.backButtonText}>
            {MinorTexts.search.backButton}
          </Text>
        </Pressable>
        <Text style={styles.title}>
          {viewMode === "new"
            ? MinorTexts.newMinorTitle
            : MinorTexts.editMinorTitle}
        </Text>
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
      >
        <View style={styles.formGrid}>
          <View style={styles.formRow}>
            <Text style={styles.label}>{MinorTexts.labels.minorName}</Text>
            <TextInput
              style={[styles.input, formErrors.anaDalAdi && styles.errorInput]}
              value={formData.anaDalAdi}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, anaDalAdi: text }))
              }
              placeholder={MinorTexts.placeholders.enterName}
            />
            {formErrors.anaDalAdi && (
              <Text style={styles.errorText}>
                {MinorTexts.validation.nameMin}
              </Text>
            )}
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>{MinorTexts.labels.major}</Text>
            <View
              style={[
                styles.pickerContainer,
                formErrors.bolumUuid && styles.errorInput,
              ]}
            >
              <Picker
                selectedValue={formData.bolumUuid}
                style={styles.picker}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, bolumUuid: value }))
                }
              >
                <Picker.Item
                  label={MinorTexts.placeholders.selectMajor}
                  value=""
                />
                {majors.map((major) => (
                  <Picker.Item
                    key={major.bolumUuid}
                    label={major.bolumAdi}
                    value={major.bolumUuid}
                  />
                ))}
              </Picker>
            </View>
            {formErrors.bolumUuid && (
              <Text style={styles.errorText}>
                {MinorTexts.validation.majorRequired}
              </Text>
            )}
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>{MinorTexts.labels.foundedDate}</Text>
            <TextInput
              style={styles.input}
              value={formData.kurulusTarihi}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, kurulusTarihi: text }))
              }
              placeholder={MinorTexts.placeholders.enterFoundedDate}
            />
          </View>
        </View>

        <View style={styles.formActions}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => handleViewModeChange("list")}
          >
            <Text style={styles.cancelButtonText}>
              {MinorTexts.actions.cancel}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.saveButton,
              !isFormValid() && styles.saveButtonDisabled,
            ]}
            disabled={!isFormValid()}
            onPress={viewMode === "new" ? handleCreateMinor : handleUpdateMinor}
          >
            <Text style={styles.saveButtonText}>
              {viewMode === "new"
                ? MinorTexts.actions.create
                : MinorTexts.actions.update}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );

  const renderMinorView = () => {
    if (!editingMinor) {
      return (
        <View style={styles.formContainer}>
          <Text>Ana dal bulunamadı</Text>
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
              {MinorTexts.search.backButton}
            </Text>
          </Pressable>
          <Text style={styles.title}>{MinorTexts.minorInfoTitle}</Text>
        </View>

        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
        >
          <View style={styles.profileSectionsContainer}>
            <Text style={styles.profileSubtitle}>
              Ana dalın detaylı bilgilerini görüntüleyin
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Temel Bilgiler</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{MinorTexts.labels.name}</Text>
                <View style={styles.copyableRow}>
                  <Text style={styles.infoValue}>{editingMinor.anaDalAdi}</Text>
                  <Pressable
                    style={styles.copyButton}
                    onPress={() =>
                      handleCopyToClipboard(
                        editingMinor.anaDalAdi,
                        "Ana Dal Adı",
                      )
                    }
                  >
                    <IconSymbol name="copy" size={12} color="#007AFF" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {MinorTexts.labels.majorLabel}
                </Text>
                <Text style={styles.infoValue}>
                  {getMajorName(editingMinor.bolumUuid)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {MinorTexts.labels.founded}
                </Text>
                <Text style={styles.infoValue}>
                  {formatDate(editingMinor.kurulusTarihi)}
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
      <NavigationBar userName="Ana Dal" />
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
          {viewMode === "list" && renderMinorList()}
          {(viewMode === "new" || viewMode === "edit") && renderMinorForm()}
          {viewMode === "view" && renderMinorView()}
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
  filterPickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    backgroundColor: "#fff",
    height: 40,
    justifyContent: "center",
  },
  filterPicker: {
    height: 40,
    fontSize: 14,
    color: "#333",
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
  colMajor: { flex: 2.0, paddingHorizontal: 8 },
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
    minHeight: 48,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  picker: {
    height: 48,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
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

export default MinorManagement;
