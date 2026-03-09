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
  EmailAddRequest,
  emailAPI,
  EpostaTipi,
  OzlukEmail,
} from "../../services/ozluk-api";
import { IconSymbol } from "../ui/icon-symbol";

interface EmailsProps {
  onRefresh?: () => void;
  targetUserUuid?: string; // Admin panel için başka kullanıcının verilerini görüntülemek
}

const Emails: React.FC<EmailsProps> = ({ onRefresh, targetUserUuid }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [emails, setEmails] = useState<OzlukEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<OzlukEmail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const emailTypeOptions = [
    { label: "KIŞISEL", value: EpostaTipi.KISISEL },
    { label: "İŞ", value: EpostaTipi.IS },
    { label: "DİĞER", value: EpostaTipi.DIGER },
    { label: "PERSONEL", value: EpostaTipi.Personel },
  ];

  // Helper function to get email type label
  const getEmailTypeLabel = (type: string | number): string => {
    const typeNum = typeof type === "string" ? parseInt(type) : type;
    const option = emailTypeOptions.find((opt) => opt.value === typeNum);
    return option ? option.label : "BİLİNMEYEN";
  };

  // Form state
  const [form, setForm] = useState<EmailAddRequest>({
    epostaAdresi: "",
    epostaTipi: EpostaTipi.KISISEL,
    oncelikli: false,
  });

  // Load emails
  const loadEmails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await emailAPI.getEmails(targetUserUuid);
      setEmails(data);
      if (selectedEmail && data.length > 0) {
        const updated = data.find(
          (e) => e.epostaUuid === selectedEmail.epostaUuid,
        );
        if (updated) setSelectedEmail(updated);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "E-postaları yükleme başarısız",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      loadEmails();
    }
  }, [isExpanded]);

  // Handle email selection
  const handleSelectEmail = (email: OzlukEmail) => {
    setSelectedEmail(email);
    const emailType =
      typeof email.epostaTipi === "string"
        ? parseInt(email.epostaTipi)
        : email.epostaTipi;
    setForm({
      epostaAdresi: email.epostaAdresi,
      epostaTipi: emailType as EpostaTipi,
      oncelikli: email.oncelikli,
    });
    setIsAdding(false);
  };

  // Handle add new
  const handleAddNew = () => {
    setSelectedEmail(null);
    setForm({
      epostaAdresi: "",
      epostaTipi: EpostaTipi.KISISEL,
      oncelikli: false,
    });
    setIsAdding(true);
  };

  // Handle save
  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (isAdding) {
        await emailAPI.addEmail(form, targetUserUuid);
      } else if (selectedEmail) {
        await emailAPI.updateEmail(
          {
            ...form,
            epostaUuid: selectedEmail.epostaUuid,
          },
          targetUserUuid,
        );
      }
      await loadEmails();
      setIsAdding(false);
      setSelectedEmail(null);
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
    if (!selectedEmail) return;
    if (!confirm("Bu e-posta adresini silmek istediğinize emin misiniz?"))
      return;

    try {
      setIsLoading(true);
      await emailAPI.deleteEmail(selectedEmail.epostaUuid, targetUserUuid);
      await loadEmails();
      setSelectedEmail(null);
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
          name="envelope"
          size={18}
          color="#666"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.sectionTitle}>E-Postalar</Text>
      </View>

      {isExpanded && (
        <View style={styles.sectionContent}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Emails Dropdown */}
          {emails.length > 0 ? (
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Mevcut E-Postalar:</Text>
              <ScrollView style={styles.dropdown} nestedScrollEnabled>
                {emails.map((email) => (
                  <Pressable
                    key={email.epostaUuid}
                    style={[
                      styles.dropdownItem,
                      selectedEmail?.epostaUuid === email.epostaUuid &&
                        styles.selectedItem,
                      hoveredItem === email.epostaUuid && styles.hoveredItem,
                    ]}
                    onPress={() => handleSelectEmail(email)}
                    {...(Platform.OS === "web" &&
                      ({
                        onMouseEnter: () => setHoveredItem(email.epostaUuid),
                        onMouseLeave: () => setHoveredItem(null),
                      } as any))}
                  >
                    <Text style={styles.dropdownItemText}>
                      {email.epostaAdresi} (
                      {getEmailTypeLabel(email.epostaTipi)})
                    </Text>
                    {email.oncelikli && (
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
            <Text style={styles.emptyText}>Henüz e-posta eklenmemiştir</Text>
          )}

          {/* Form */}
          {(isAdding || selectedEmail) && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {isAdding ? "Yeni E-Posta Ekle" : "E-Postayı Düzenle"}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="E-Posta Adresi"
                value={form.epostaAdresi}
                onChangeText={(text) =>
                  setForm({ ...form, epostaAdresi: text })
                }
                editable={!isLoading}
                keyboardType="email-address"
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.label}>E-Posta Tipi:</Text>
                <View style={styles.typeButtons}>
                  {emailTypeOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.typeButton,
                        form.epostaTipi === option.value &&
                          styles.typeButtonActive,
                      ]}
                      onPress={() =>
                        setForm({ ...form, epostaTipi: option.value })
                      }
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          form.epostaTipi === option.value &&
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
                <Text style={styles.checkboxLabel}>Öncelikli E-Posta</Text>
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

                {selectedEmail && (
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
                    setSelectedEmail(null);
                  }}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>İptal</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Add Button */}
          {!isAdding && !selectedEmail && (
            <Pressable
              style={[styles.addButton, isLoading && styles.buttonDisabled]}
              onPress={handleAddNew}
              disabled={isLoading}
            >
              <Text style={styles.addButtonText}>+ Yeni E-Posta Ekle</Text>
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

export default Emails;
