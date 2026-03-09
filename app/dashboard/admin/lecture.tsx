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
import { LectureTexts } from "../../../components/texts/lecture-texts";
import { IconSymbol } from "../../../components/ui/icon-symbol";
import Loading from "../../../components/ui/loading";
import { Tooltip } from "../../../components/ui/tooltip";
import { IdentityType } from "../../../constants/identity-types";
import {
    Lecture,
    LectureCreateRequest,
    LectureUpdateRequest,
    lectureAPI,
} from "../../../services/lecture-api";
import { getCookie } from "../../../utils/cookies";
import { getIdentityTypeFromToken } from "../../../utils/jwt";

type ViewMode = "list" | "new" | "edit" | "view";

// Form validation
const validateForm = (formData: any) => {
  const errors: { [key: string]: boolean } = {};

  if (!formData.dersKodu || formData.dersKodu.trim().length < 3) {
    errors.dersKodu = true;
  }

  if (!formData.dersAdi || formData.dersAdi.trim().length < 3) {
    errors.dersAdi = true;
  }

  if (
    !formData.haftalikDersSaati ||
    formData.haftalikDersSaati < 1 ||
    formData.haftalikDersSaati > 20
  ) {
    errors.haftalikDersSaati = true;
  }

  if (!formData.kredi || formData.kredi < 1 || formData.kredi > 10) {
    errors.kredi = true;
  }

  if (!formData.akts || formData.akts < 1 || formData.akts > 30) {
    errors.akts = true;
  }

  return errors;
};

const LectureManagement: React.FC = () => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [identityType, setIdentityType] = useState<IdentityType | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Lecture data states
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);

  // Form validation states
  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});

  // Form states
  const [formData, setFormData] = useState({
    dersKodu: "",
    dersAdi: "",
    aciklama: "",
    haftalikDersSaati: 1,
    kredi: 1,
    akts: 1,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalLectures, setTotalLectures] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);

  // Search/Filter states
  const [searchFilters, setSearchFilters] = useState({
    dersKodu: "",
    dersAdi: "",
    kredi: undefined as number | undefined,
    akts: undefined as number | undefined,
  });

  // Tooltip state for copy operations
  const [copyTooltip, setCopyTooltip] = useState<{
    visible: boolean;
    text: string;
    position?: { x: number; y: number };
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
        loadLectures();
      }
    }, 100);
    return () => clearTimeout(t);
  }, [router]);

  // Validate form whenever formData changes
  useEffect(() => {
    const errors = validateForm(formData);
    setFormErrors(errors);
  }, [formData]);

  // Safe wrapper for setLectures to ensure it's always an array
  const safeSetLectures = (newLectures: any) => {
    const safeLectures = Array.isArray(newLectures) ? newLectures : [];
    console.log("Setting lectures safely:", {
      original: newLectures,
      safe: safeLectures,
    });
    setLectures(safeLectures);
  };

  // Debug lectures state changes
  useEffect(() => {
    console.log("Lectures state changed:", {
      lectures,
      isArray: Array.isArray(lectures),
      length: Array.isArray(lectures) ? lectures.length : "not an array",
    });
  }, [lectures]);

  const loadLectures = async (page = currentPage, filters = searchFilters) => {
    try {
      setLoading(true);

      const response = await lectureAPI.getLectures({
        page,
        pageSize,
        ...filters,
      });

      console.log("Load lectures response:", response);

      const lectures = Array.isArray(response.data) ? response.data : [];
      safeSetLectures(lectures);
      setTotalLectures(response.total || 0);
      setCurrentPage(page);

      // Son sayfa kontrolü - dönen veri miktarı pageSize'dan azsa son sayfadayız
      setIsLastPage(lectures.length < pageSize);
    } catch (error: any) {
      console.error("Load lectures error:", error);
      // Set empty array on error to prevent map function errors
      safeSetLectures([]);
      setTotalLectures(0);
      setIsLastPage(true);
      Alert.alert(
        LectureTexts.errors.general,
        error.message || LectureTexts.errors.loadLecturesError,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    safeSetLectures([]); // Clear current lectures for immediate visual feedback
    loadLectures(currentPage, searchFilters);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setIsLastPage(false);
    loadLectures(1, searchFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      dersKodu: "",
      dersAdi: "",
      kredi: undefined as number | undefined,
      akts: undefined as number | undefined,
    };
    setSearchFilters(defaultFilters);
    setCurrentPage(1);
    setIsLastPage(false);
    loadLectures(1, defaultFilters);
  };

  const handleViewModeChange = (mode: ViewMode, lecture?: Lecture) => {
    setViewMode(mode);
    if ((mode === "edit" || mode === "view") && lecture) {
      setEditingLecture(lecture);
      if (mode === "edit") {
        setFormData({
          dersKodu: lecture.dersKodu,
          dersAdi: lecture.dersAdi,
          aciklama: lecture.aciklama || "",
          haftalikDersSaati: lecture.haftalikDersSaati,
          kredi: lecture.kredi,
          akts: lecture.akts,
        });
      }
    } else if (mode === "new") {
      setEditingLecture(null);
      setFormData({
        dersKodu: "",
        dersAdi: "",
        aciklama: "",
        haftalikDersSaati: 1,
        kredi: 1,
        akts: 1,
      });
    }
    setFormErrors({});
  };

  const isFormValid = () => {
    const errors = validateForm(formData);
    return Object.keys(errors).length === 0;
  };

  const handleCreateLecture = async () => {
    if (!isFormValid()) {
      Alert.alert(
        LectureTexts.errors.general,
        LectureTexts.errors.fillAllFields,
      );
      return;
    }

    try {
      setLoading(true);
      const createData: LectureCreateRequest = {
        dersKodu: formData.dersKodu.trim(),
        dersAdi: formData.dersAdi.trim(),
        aciklama: formData.aciklama.trim() || null,
        haftalikDersSaati: Number(formData.haftalikDersSaati),
        kredi: Number(formData.kredi),
        akts: Number(formData.akts),
      };

      await lectureAPI.createLecture(createData);
      Alert.alert("Başarılı", LectureTexts.success.lectureCreated);
      setViewMode("list");
      loadLectures();
    } catch (error: any) {
      console.error("Create Lecture Error:", error);

      const errorMessage = error.message || "";

      // Show error in tooltip
      setCopyTooltip({
        visible: true,
        text: errorMessage || LectureTexts.errors.createLectureError,
      });

      // Hide tooltip after 3 seconds
      setTimeout(() => {
        setCopyTooltip({ visible: false, text: "" });
      }, 3000);

      if (
        errorMessage.includes("DersKodu") ||
        errorMessage.includes("code") ||
        errorMessage.includes("kod")
      ) {
        setFormErrors({ dersKodu: errorMessage });
      } else if (
        errorMessage.includes("DersAdi") ||
        errorMessage.includes("name") ||
        errorMessage.includes("ad")
      ) {
        setFormErrors({ dersAdi: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLecture = async () => {
    if (!isFormValid()) {
      Alert.alert(
        LectureTexts.errors.general,
        LectureTexts.errors.fillAllFields,
      );
      return;
    }

    if (!editingLecture) {
      Alert.alert(
        LectureTexts.errors.general,
        LectureTexts.errors.lectureNotFoundForEdit,
      );
      return;
    }

    try {
      setLoading(true);
      const updateData: LectureUpdateRequest = {
        dersUuid: editingLecture.dersUuid,
        dersKodu: formData.dersKodu.trim(),
        dersAdi: formData.dersAdi.trim(),
        aciklama: formData.aciklama.trim() || null,
        haftalikDersSaati: Number(formData.haftalikDersSaati),
        kredi: Number(formData.kredi),
        akts: Number(formData.akts),
      };

      await lectureAPI.updateLecture(updateData);
      Alert.alert("Başarılı", LectureTexts.success.lectureUpdated);
      setViewMode("list");
      loadLectures();
    } catch (error: any) {
      console.error("Update Lecture Error:", error);

      const errorMessage = error.message || "";

      // Show error in tooltip
      setCopyTooltip({
        visible: true,
        text: errorMessage || LectureTexts.errors.updateLectureError,
      });

      // Hide tooltip after 3 seconds
      setTimeout(() => {
        setCopyTooltip({ visible: false, text: "" });
      }, 3000);

      if (
        errorMessage.includes("DersKodu") ||
        errorMessage.includes("code") ||
        errorMessage.includes("kod")
      ) {
        setFormErrors({ dersKodu: errorMessage });
      } else if (
        errorMessage.includes("DersAdi") ||
        errorMessage.includes("name") ||
        errorMessage.includes("ad")
      ) {
        setFormErrors({ dersAdi: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLecture = async (lecture: Lecture) => {
    try {
      setLoading(true);

      await lectureAPI.deleteLecture(lecture.dersUuid);

      // Liste güncelleme
      await loadLectures(currentPage, searchFilters);

      Alert.alert("Başarılı", LectureTexts.success.lectureDeleted);
    } catch (error: any) {
      console.error("Delete Lecture Error:", error);
      Alert.alert(
        "Silme İşlemi Başarısız",
        error.message || LectureTexts.errors.deleteLectureError,
      );
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard function
  const handleCopyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);

    // Show tooltip
    setCopyTooltip({
      visible: true,
      text: LectureTexts.copy(label),
    });

    // Hide tooltip after 2 seconds
    setTimeout(() => {
      setCopyTooltip({ visible: false, text: "" });
    }, 2000);
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <Loading text={LectureTexts.messages.loading} />
      </View>
    );
  }

  const isAdmin = identityType === IdentityType.PERSONEL;

  const renderSearchFilters = () => (
    <View style={styles.searchContainer}>
      <Text style={styles.searchTitle}>{LectureTexts.search.filtersTitle}</Text>
      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Ders Kodu</Text>
          <TextInput
            style={styles.filterInput}
            value={searchFilters.dersKodu}
            onChangeText={(text) =>
              setSearchFilters((prev) => ({ ...prev, dersKodu: text }))
            }
            placeholder={LectureTexts.placeholders.searchCode}
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Ders Adı</Text>
          <TextInput
            style={styles.filterInput}
            value={searchFilters.dersAdi}
            onChangeText={(text) =>
              setSearchFilters((prev) => ({ ...prev, dersAdi: text }))
            }
            placeholder={LectureTexts.placeholders.searchName}
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Kredi</Text>
          <TextInput
            style={styles.filterInput}
            value={searchFilters.kredi?.toString() || ""}
            onChangeText={(text) =>
              setSearchFilters((prev) => ({
                ...prev,
                kredi: text ? parseInt(text) || undefined : undefined,
              }))
            }
            placeholder="Kredi ara..."
            keyboardType="numeric"
          />
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>AKTS</Text>
          <TextInput
            style={styles.filterInput}
            value={searchFilters.akts?.toString() || ""}
            onChangeText={(text) =>
              setSearchFilters((prev) => ({
                ...prev,
                akts: text ? parseInt(text) || undefined : undefined,
              }))
            }
            placeholder="AKTS ara..."
            keyboardType="numeric"
          />
        </View>

        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <IconSymbol name="magnifyingglass" size={16} color="#fff" />
          <Text style={styles.searchButtonText}>
            {LectureTexts.search.searchButton}
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

  const renderLectureList = () => (
    <View style={styles.listContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.title}>{LectureTexts.pageTitle}</Text>
        <View style={styles.headerButtons}>
          <Pressable style={styles.refreshButton} onPress={handleRefresh}>
            <IconSymbol name="arrow.clockwise" size={16} color="#666" />
            <Text style={styles.refreshButtonText}>
              {LectureTexts.search.refreshButton}
            </Text>
          </Pressable>
          <Pressable
            style={styles.addButton}
            onPress={() => handleViewModeChange("new")}
          >
            <IconSymbol name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>
              {LectureTexts.search.addButton}
            </Text>
          </Pressable>
        </View>
      </View>

      {renderSearchFilters()}

      {loading && (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      )}

      <ScrollView style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colCode]}>
            {LectureTexts.table.code}
          </Text>
          <Text style={[styles.tableHeaderText, styles.colName]}>
            {LectureTexts.table.name}
          </Text>
          <Text style={[styles.tableHeaderText, styles.colCredit]}>
            {LectureTexts.table.credit}
          </Text>
          <Text style={[styles.tableHeaderText, styles.colEcts]}>
            {LectureTexts.table.ects}
          </Text>
          <Text style={[styles.tableHeaderText, styles.colHours]}>
            {LectureTexts.table.weeklyHours}
          </Text>
          <Text style={[styles.tableHeaderText, styles.colActions]}>
            {LectureTexts.table.actions}
          </Text>
        </View>

        {Array.isArray(lectures) &&
          lectures.map((lecture, index) => (
            <View
              key={lecture.dersUuid}
              style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
            >
              <View style={styles.colCode}>
                <View style={styles.codeCellContainer}>
                  <Text style={styles.tableCell}>{lecture.dersKodu}</Text>
                  <Pressable
                    style={styles.copyButton}
                    onPress={() =>
                      handleCopyToClipboard(lecture.dersKodu, "Ders Kodu")
                    }
                  >
                    <IconSymbol name="copy" size={12} color="#007AFF" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.colName}>
                <Text style={styles.tableCell}>{lecture.dersAdi}</Text>
              </View>

              <View style={styles.colCredit}>
                <Text style={styles.tableCell}>{lecture.kredi}</Text>
              </View>

              <View style={styles.colEcts}>
                <Text style={styles.tableCell}>{lecture.akts}</Text>
              </View>

              <View style={styles.colHours}>
                <Text style={styles.tableCell}>
                  {lecture.haftalikDersSaati}
                </Text>
              </View>

              <View style={styles.colActions}>
                <View style={styles.tableCellActions}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => handleViewModeChange("edit", lecture)}
                  >
                    <IconSymbol name="pencil" size={12} color="#007AFF" />
                    <Text
                      style={[styles.actionButtonText, { color: "#007AFF" }]}
                    >
                      {LectureTexts.actions.edit}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.viewButton}
                    onPress={() => handleViewModeChange("view", lecture)}
                  >
                    <IconSymbol
                      name="magnifyingglass"
                      size={12}
                      color="#34C759"
                    />
                    <Text style={styles.viewButtonText}>
                      {LectureTexts.actions.view}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        "Silme Onayı",
                        `${lecture.dersKodu} - ${lecture.dersAdi} dersini silmek istediğinizden emin misiniz?`,
                        [
                          { text: "İptal", style: "cancel" },
                          {
                            text: "Sil",
                            style: "destructive",
                            onPress: () => handleDeleteLecture(lecture),
                          },
                        ],
                      );
                    }}
                  >
                    <IconSymbol name="trash" size={12} color="#FF3B30" />
                    <Text
                      style={[styles.actionButtonText, { color: "#FF3B30" }]}
                    >
                      {LectureTexts.actions.delete}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}

        {(!Array.isArray(lectures) || lectures.length === 0) && !loading && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              {LectureTexts.messages.noData}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.pagination}>
        <Text style={styles.paginationText}>
          {LectureTexts.messages.totalLectures(totalLectures, currentPage)}
          {totalLectures > 0 &&
            ` / ${Math.ceil(totalLectures / pageSize) || 1}`}
        </Text>
        <View style={styles.paginationButtons}>
          <Pressable
            style={[
              styles.pageButton,
              currentPage <= 1 && styles.pageButtonDisabled,
            ]}
            disabled={currentPage <= 1}
            onPress={() => loadLectures(currentPage - 1, searchFilters)}
          >
            <Text
              style={[
                styles.pageButtonText,
                currentPage <= 1 && styles.disabledButtonText,
              ]}
            >
              {LectureTexts.actions.previous}
            </Text>
          </Pressable>

          <Text style={styles.currentPageText}>{currentPage}</Text>

          <Pressable
            style={[styles.pageButton, isLastPage && styles.pageButtonDisabled]}
            disabled={isLastPage}
            onPress={() => loadLectures(currentPage + 1, searchFilters)}
          >
            <Text
              style={[
                styles.pageButtonText,
                isLastPage && styles.disabledButtonText,
              ]}
            >
              {LectureTexts.actions.next}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderLectureForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Pressable
          style={styles.backButton}
          onPress={() => handleViewModeChange("list")}
        >
          <IconSymbol name="arrow.left" size={16} color="#007AFF" />
          <Text style={styles.backButtonText}>
            {LectureTexts.search.backButton}
          </Text>
        </Pressable>
        <Text style={styles.title}>
          {viewMode === "new"
            ? LectureTexts.newLectureTitle
            : LectureTexts.editLectureTitle}
        </Text>
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
      >
        <View style={styles.formGrid}>
          <View style={styles.formRow}>
            <Text style={styles.label}>{LectureTexts.labels.lectureCode}</Text>
            <TextInput
              style={[styles.input, formErrors.dersKodu && styles.errorInput]}
              value={formData.dersKodu}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, dersKodu: text }))
              }
              placeholder={LectureTexts.placeholders.enterCode}
            />
            {formErrors.dersKodu && (
              <Text style={styles.errorText}>
                {LectureTexts.validation.codePattern}
              </Text>
            )}
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>{LectureTexts.labels.lectureName}</Text>
            <TextInput
              style={[styles.input, formErrors.dersAdi && styles.errorInput]}
              value={formData.dersAdi}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, dersAdi: text }))
              }
              placeholder={LectureTexts.placeholders.enterName}
            />
            {formErrors.dersAdi && (
              <Text style={styles.errorText}>
                {LectureTexts.validation.nameMin}
              </Text>
            )}
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>{LectureTexts.labels.description}</Text>
            <TextInput
              style={styles.textArea}
              value={formData.aciklama}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, aciklama: text }))
              }
              placeholder={LectureTexts.placeholders.enterDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>{LectureTexts.labels.weeklyHours}</Text>
            <TextInput
              style={[
                styles.input,
                formErrors.haftalikDersSaati && styles.errorInput,
              ]}
              value={formData.haftalikDersSaati.toString()}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  haftalikDersSaati: parseInt(text) || 1,
                }))
              }
              placeholder={LectureTexts.placeholders.enterWeeklyHours}
              keyboardType="numeric"
            />
            {formErrors.haftalikDersSaati && (
              <Text style={styles.errorText}>
                {LectureTexts.validation.hoursRange}
              </Text>
            )}
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>{LectureTexts.labels.credit}</Text>
            <TextInput
              style={[styles.input, formErrors.kredi && styles.errorInput]}
              value={formData.kredi.toString()}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, kredi: parseInt(text) || 1 }))
              }
              placeholder={LectureTexts.placeholders.enterCredit}
              keyboardType="numeric"
            />
            {formErrors.kredi && (
              <Text style={styles.errorText}>
                {LectureTexts.validation.creditRange}
              </Text>
            )}
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>{LectureTexts.labels.ects}</Text>
            <TextInput
              style={[styles.input, formErrors.akts && styles.errorInput]}
              value={formData.akts.toString()}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, akts: parseInt(text) || 1 }))
              }
              placeholder={LectureTexts.placeholders.enterEcts}
              keyboardType="numeric"
            />
            {formErrors.akts && (
              <Text style={styles.errorText}>
                {LectureTexts.validation.ectsRange}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.formActions}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => handleViewModeChange("list")}
          >
            <Text style={styles.cancelButtonText}>
              {LectureTexts.actions.cancel}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.saveButton,
              !isFormValid() && styles.saveButtonDisabled,
            ]}
            disabled={!isFormValid()}
            onPress={
              viewMode === "new" ? handleCreateLecture : handleUpdateLecture
            }
          >
            <Text style={styles.saveButtonText}>
              {viewMode === "new"
                ? LectureTexts.actions.create
                : LectureTexts.actions.update}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );

  const renderLectureView = () => {
    if (!editingLecture) {
      return (
        <View style={styles.formContainer}>
          <Text>Ders bulunamadı</Text>
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
              {LectureTexts.search.backButton}
            </Text>
          </Pressable>
          <Text style={styles.title}>{LectureTexts.lectureInfoTitle}</Text>
        </View>

        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
        >
          <View style={styles.profileSectionsContainer}>
            <Text style={styles.profileSubtitle}>
              Dersin detaylı bilgilerini görüntüleyin ve ders kodunu kopyalayın
            </Text>

            <View style={styles.lectureInfoBox}>
              <Text style={styles.lectureInfoTitle}>Temel Bilgiler</Text>

              <View style={styles.lectureInfoRow}>
                <Text style={styles.lectureInfoLabel}>
                  {LectureTexts.labels.code}
                </Text>
                <View style={styles.copyableRow}>
                  <Text style={styles.lectureInfoValue}>
                    {editingLecture.dersKodu}
                  </Text>
                  <Pressable
                    style={styles.copyButton}
                    onPress={() =>
                      handleCopyToClipboard(
                        editingLecture.dersKodu,
                        "Ders Kodu",
                      )
                    }
                  >
                    <IconSymbol name="copy" size={12} color="#007AFF" />
                  </Pressable>
                </View>
              </View>

              <View style={styles.lectureInfoRow}>
                <Text style={styles.lectureInfoLabel}>
                  {LectureTexts.labels.name}
                </Text>
                <Text style={styles.lectureInfoValue}>
                  {editingLecture.dersAdi}
                </Text>
              </View>

              {editingLecture.aciklama && (
                <View style={styles.lectureInfoRow}>
                  <Text style={styles.lectureInfoLabel}>
                    {LectureTexts.labels.desc}
                  </Text>
                  <Text
                    style={[
                      styles.lectureInfoValue,
                      styles.lectureDescriptionText,
                    ]}
                  >
                    {editingLecture.aciklama}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.lectureInfoBox}>
              <Text style={styles.lectureInfoTitle}>
                Kredi ve Saat Bilgileri
              </Text>

              <View style={styles.lectureInfoRow}>
                <Text style={styles.lectureInfoLabel}>
                  {LectureTexts.labels.creditShort}
                </Text>
                <View style={styles.creditBadge}>
                  <Text style={styles.creditBadgeText}>
                    {editingLecture.kredi}
                  </Text>
                </View>
              </View>

              <View style={styles.lectureInfoRow}>
                <Text style={styles.lectureInfoLabel}>
                  {LectureTexts.labels.ectsShort}
                </Text>
                <View style={styles.ectsBadge}>
                  <Text style={styles.ectsBadgeText}>
                    {editingLecture.akts}
                  </Text>
                </View>
              </View>

              <View style={styles.lectureInfoRow}>
                <Text style={styles.lectureInfoLabel}>
                  {LectureTexts.labels.weekly}
                </Text>
                <View style={styles.hoursBadge}>
                  <Text style={styles.hoursBadgeText}>
                    {editingLecture.haftalikDersSaati}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <NavigationBar userName="Ders" />
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
                name={isPanelCollapsed ? "chevron.right" : "chevron.right"}
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
          {viewMode === "list" && renderLectureList()}
          {(viewMode === "new" || viewMode === "edit") && renderLectureForm()}
          {viewMode === "view" && renderLectureView()}
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
    fontWeight: "500",
  },
  tableCellActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  colCode: { flex: 1.2, paddingHorizontal: 12 },
  colName: { flex: 2.0, paddingHorizontal: 8 },
  colCredit: { flex: 0.6, paddingHorizontal: 8 },
  colEcts: { flex: 0.6, paddingHorizontal: 8 },
  colHours: { flex: 0.8, paddingHorizontal: 8 },
  colActions: { flex: 2.2, paddingHorizontal: 8 },
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
  textArea: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
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
  // View/Profile styles
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
  profileSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  lectureInfoBox: {
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
  lectureInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  lectureInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 2,
  },
  lectureInfoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    minWidth: 80,
    marginRight: 12,
  },
  lectureInfoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  lectureDescriptionText: {
    fontSize: 14,
    color: "#484848",
    fontWeight: "400",
    lineHeight: 20,
    fontStyle: "italic",
  },
  copyableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  // Badge styles for view mode
  creditBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  creditBadgeText: {
    color: "#1976D2",
    fontWeight: "600",
    fontSize: 13,
  },
  ectsBadge: {
    backgroundColor: "#F1F8E9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8BC34A",
  },
  ectsBadgeText: {
    color: "#558B2F",
    fontWeight: "600",
    fontSize: 13,
  },
  hoursBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  hoursBadgeText: {
    color: "#E65100",
    fontWeight: "600",
    fontSize: 13,
  },
  // Copy button for table
  codeCellContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  // Toggle button styles
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

export default LectureManagement;
