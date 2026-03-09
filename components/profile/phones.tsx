import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  OzlukTelefon,
  PhoneAddRequest,
  phoneAPI,
  TelefonTipi,
} from "../../services/ozluk-api";
import { IconSymbol } from "../ui/icon-symbol";

interface PhonesProps {
  onRefresh?: () => void;
  targetUserUuid?: string; // Admin panel için başka kullanıcının verilerini görüntülemek
}

const Phones: React.FC<PhonesProps> = ({ onRefresh, targetUserUuid }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [phones, setPhones] = useState<OzlukTelefon[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<OzlukTelefon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const phoneTypeOptions = [
    { label: "CEP", value: TelefonTipi.CEP },
    { label: "EV", value: TelefonTipi.EV },
    { label: "İŞ", value: TelefonTipi.IS },
  ];

  // Helper function to get phone type label
  const getPhoneTypeLabel = (type: string | number): string => {
    const typeNum = typeof type === "string" ? parseInt(type) : type;
    const option = phoneTypeOptions.find((opt) => opt.value === typeNum);
    return option ? option.label : "BİLİNMEYEN";
  };

  // Form state
  const [form, setForm] = useState<PhoneAddRequest>({
    ulkeKodu: "",
    telefonNo: "",
    telefonTipi: TelefonTipi.CEP,
    oncelikli: false,
  });

  // Load phones
  const loadPhones = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await phoneAPI.getPhones(targetUserUuid);
      setPhones(data);
      if (selectedPhone && data.length > 0) {
        const updated = data.find(
          (p) => p.telefonUuid === selectedPhone.telefonUuid,
        );
        if (updated) setSelectedPhone(updated);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Telefonları yükleme başarısız",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      loadPhones();
    }
  }, [isExpanded]);

  // Handle phone selection
  const handleSelectPhone = (phone: OzlukTelefon) => {
    setSelectedPhone(phone);
    const phoneType =
      typeof phone.telefonTipi === "string"
        ? parseInt(phone.telefonTipi)
        : phone.telefonTipi;
    setForm({
      ulkeKodu: phone.ulkeKodu,
      telefonNo: phone.telefonNo,
      telefonTipi: phoneType as TelefonTipi,
      oncelikli: phone.oncelikli,
    });
    setIsAdding(false);
  };

  // Handle add new
  const handleAddNew = () => {
    setSelectedPhone(null);
    setForm({
      ulkeKodu: "",
      telefonNo: "",
      telefonTipi: TelefonTipi.CEP,
      oncelikli: false,
    });
    setIsAdding(true);
  };

  // Handle save
  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (isAdding) {
        await phoneAPI.addPhone(form, targetUserUuid);
      } else if (selectedPhone) {
        await phoneAPI.updatePhone(
          {
            ...form,
            telefonUuid: selectedPhone.telefonUuid,
          },
          targetUserUuid,
        );
      }
      await loadPhones();
      setIsAdding(false);
      setSelectedPhone(null);
      setError(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedPhone) return;
    if (!confirm("Bu telefon numarasını silmek istediğinize emin misiniz?"))
      return;

    try {
      setIsLoading(true);
      await phoneAPI.deletePhone(selectedPhone.telefonUuid, targetUserUuid);
      await loadPhones();
      setSelectedPhone(null);
      setIsAdding(false);
      setError(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Silme işlemi başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <IconSymbol
          name="phone"
          size={18}
          color="#666"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.sectionTitle}>Telefonlar</Text>
      </View>

      {isExpanded && (
        <View style={styles.sectionContent}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Phones Dropdown */}
          {phones.length > 0 ? (
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Mevcut Telefonlar:</Text>
              <ScrollView style={styles.dropdown} nestedScrollEnabled>
                {phones.map((phone) => (
                  <Pressable
                    key={phone.telefonUuid}
                    style={[
                      styles.dropdownItem,
                      selectedPhone?.telefonUuid === phone.telefonUuid &&
                        styles.selectedItem,
                      hoveredItem === phone.telefonUuid && styles.hoveredItem,
                    ]}
                    onPress={() => handleSelectPhone(phone)}
                    {...(Platform.OS === "web" &&
                      ({
                        onMouseEnter: () => setHoveredItem(phone.telefonUuid),
                        onMouseLeave: () => setHoveredItem(null),
                      } as any))}
                  >
                    <Text style={styles.dropdownItemText}>
                      {phone.ulkeKodu} {phone.telefonNo} (
                      {getPhoneTypeLabel(phone.telefonTipi)})
                    </Text>
                    {phone.oncelikli && (
                      <View style={styles.priorityBadge}>
                        <IconSymbol
                          name="checkmark.circle.fill"
                          size={12}
                          color="#34C759"
                        />
                        <Text style={styles.priorityBadgeText}>Öncelikli</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : (
            <Text style={styles.emptyText}>Henüz telefon eklenmemiştir</Text>
          )}

          {/* Form */}
          {(isAdding || selectedPhone) && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {isAdding ? "Yeni Telefon Ekle" : "Telefonu Düzenle"}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Ülke Kodu (örn: +90)"
                value={form.ulkeKodu}
                onChangeText={(text) => setForm({ ...form, ulkeKodu: text })}
                editable={!isLoading}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefon Numarası"
                value={form.telefonNo}
                onChangeText={(text) => setForm({ ...form, telefonNo: text })}
                editable={!isLoading}
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Telefon Tipi:</Text>
                <View style={styles.typeButtons}>
                  {phoneTypeOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.typeButton,
                        form.telefonTipi === option.value &&
                          styles.typeButtonActive,
                      ]}
                      onPress={() =>
                        setForm({ ...form, telefonTipi: option.value })
                      }
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          form.telefonTipi === option.value &&
                            styles.typeButtonTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                style={[
                  styles.checkbox,
                  form.oncelikli && styles.checkboxChecked,
                ]}
                onPress={() => setForm({ ...form, oncelikli: !form.oncelikli })}
              >
                <Text style={styles.checkboxLabel}>Öncelikli Telefon</Text>
              </Pressable>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[
                    styles.button,
                    styles.saveButton,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>Kaydet</Text>
                </Pressable>

                {selectedPhone && (
                  <Pressable
                    style={[
                      styles.button,
                      styles.deleteButton,
                      isLoading && styles.buttonDisabled,
                    ]}
                    onPress={handleDelete}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>Sil</Text>
                  </Pressable>
                )}

                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setIsAdding(false);
                    setSelectedPhone(null);
                  }}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>İptal</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Add Button */}
          {!isAdding && !selectedPhone && (
            <Pressable
              style={[styles.addButton, isLoading && styles.buttonDisabled]}
              onPress={handleAddNew}
              disabled={isLoading}
            >
              <Text style={styles.addButtonText}>+ Yeni Telefon Ekle</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    cursor: Platform.OS === "web" ? "pointer" : undefined,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181818",
  },
  sectionContent: {
    padding: 16,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  dropdown: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: Platform.OS === "web" ? "pointer" : undefined,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2e7d32",
    textTransform: "uppercase",
  },
  dropdownItemText: {
    fontSize: 13,
    color: "#333",
  },
  selectedItem: {
    backgroundColor: "#e8f4f8",
  },
  hoveredItem: {
    backgroundColor: "#f5f5f5",
  },
  formContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  formTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    color: "#181818",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#333",
  },
  pickerContainer: {
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
    cursor: Platform.OS === "web" ? "pointer" : undefined,
  },
  typeButtonActive: {
    backgroundColor: "#0288d1",
    borderColor: "#0288d1",
  },
  typeButtonText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
  checkboxChecked: {
    backgroundColor: "#e8f4f8",
    borderColor: "#0288d1",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
    cursor: Platform.OS === "web" ? "pointer" : undefined,
  },
  saveButton: {
    backgroundColor: "#4caf50",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  cancelButton: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  addButton: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#2196f3",
    borderStyle: "dashed",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    cursor: Platform.OS === "web" ? "pointer" : undefined,
  },
  addButtonText: {
    color: "#2196f3",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 12,
  },
  errorText: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 13,
  },
});

export default Phones;
