import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AddresAddRequest, addressAPI, OzlukAdres } from '../../services/ozluk-api';

interface AddressesProps {
  onRefresh?: () => void;
}

const Addresses: React.FC<AddressesProps> = ({ onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [addresses, setAddresses] = useState<OzlukAdres[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<OzlukAdres | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<AddresAddRequest>({
    sokak: '',
    sehir: '',
    ilce: '',
    postaKodu: '',
    ulke: '',
    oncelikli: false,
  });

  // Load addresses
  const loadAddresses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await addressAPI.getAddresses();
      setAddresses(data);
      if (selectedAddress && data.length > 0) {
        const updated = data.find(a => a.adresUuid === selectedAddress.adresUuid);
        if (updated) setSelectedAddress(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Adresleri yükleme başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      loadAddresses();
    }
  }, [isExpanded]);

  // Handle address selection
  const handleSelectAddress = (address: OzlukAdres) => {
    setSelectedAddress(address);
    setForm({
      sokak: address.sokak,
      sehir: address.sehir,
      ilce: address.ilce,
      postaKodu: address.postaKodu,
      ulke: address.ulke,
      oncelikli: address.oncelikli,
    });
    setIsAdding(false);
  };

  // Handle add new
  const handleAddNew = () => {
    setSelectedAddress(null);
    setForm({
      sokak: '',
      sehir: '',
      ilce: '',
      postaKodu: '',
      ulke: '',
      oncelikli: false,
    });
    setIsAdding(true);
  };

  // Handle save
  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (isAdding) {
        await addressAPI.addAddress(form);
      } else if (selectedAddress) {
        await addressAPI.updateAddress({
          ...form,
          adresUuid: selectedAddress.adresUuid,
        });
      }
      await loadAddresses();
      setIsAdding(false);
      setSelectedAddress(null);
      setError(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedAddress) return;
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return;

    try {
      setIsLoading(true);
      await addressAPI.deleteAddress(selectedAddress.adresUuid);
      await loadAddresses();
      setSelectedAddress(null);
      setIsAdding(false);
      setError(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme işlemi başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📍 Adresler</Text>
      </View>

      {isExpanded && (
        <View style={styles.sectionContent}>
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Addresses Dropdown */}
          {addresses.length > 0 ? (
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Mevcut Adresler:</Text>
              <ScrollView style={styles.dropdown} nestedScrollEnabled>
                {addresses.map((addr) => (
                  <Pressable
                    key={addr.adresUuid}
                    style={[
                      styles.dropdownItem,
                      selectedAddress?.adresUuid === addr.adresUuid && styles.selectedItem,
                      hoveredItem === addr.adresUuid && styles.hoveredItem,
                    ]}
                    onPress={() => handleSelectAddress(addr)}
                    {...(Platform.OS === 'web' && {
                      onMouseEnter: () => setHoveredItem(addr.adresUuid),
                      onMouseLeave: () => setHoveredItem(null),
                    } as any)}
                  >
                    <Text style={styles.dropdownItemText}>
                      {addr.sokak}, {addr.sehir}
                      {addr.oncelikli && ' ⭐'}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : (
            <Text style={styles.emptyText}>Henüz adres eklenmemiştir</Text>
          )}

          {/* Form */}
          {(isAdding || selectedAddress) && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {isAdding ? 'Yeni Adres Ekle' : 'Adresi Düzenle'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Sokak"
                value={form.sokak}
                onChangeText={(text) => setForm({ ...form, sokak: text })}
                editable={!isLoading}
              />
              <TextInput
                style={styles.input}
                placeholder="Şehir"
                value={form.sehir}
                onChangeText={(text) => setForm({ ...form, sehir: text })}
                editable={!isLoading}
              />
              <TextInput
                style={styles.input}
                placeholder="İlçe"
                value={form.ilce}
                onChangeText={(text) => setForm({ ...form, ilce: text })}
                editable={!isLoading}
              />
              <TextInput
                style={styles.input}
                placeholder="Posta Kodu"
                value={form.postaKodu}
                onChangeText={(text) => setForm({ ...form, postaKodu: text })}
                editable={!isLoading}
              />
              <TextInput
                style={styles.input}
                placeholder="Ülke"
                value={form.ulke}
                onChangeText={(text) => setForm({ ...form, ulke: text })}
                editable={!isLoading}
              />

              <Pressable
                style={[styles.checkbox, form.oncelikli && styles.checkboxChecked]}
                onPress={() => setForm({ ...form, oncelikli: !form.oncelikli })}
              >
                <Text style={styles.checkboxLabel}>Öncelikli Adres</Text>
              </Pressable>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>Kaydet</Text>
                </Pressable>

                {selectedAddress && (
                  <Pressable
                    style={[styles.button, styles.deleteButton, isLoading && styles.buttonDisabled]}
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
                    setSelectedAddress(null);
                  }}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>İptal</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Add Button */}
          {!isAdding && !selectedAddress && (
            <Pressable
              style={styles.addButton}
              onPress={handleAddNew}
              disabled={isLoading}
            >
              <Text style={styles.addButtonText}>+ Yeni Adres Ekle</Text>
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
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181818',
  },
  sectionContent: {
    padding: 16,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  dropdown: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#333',
  },
  selectedItem: {
    backgroundColor: '#e8f4f8',
  },
  hoveredItem: {
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#181818',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#333',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  checkboxChecked: {
    backgroundColor: '#e8f4f8',
    borderColor: '#0288d1',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  saveButton: {
    backgroundColor: '#4caf50',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  addButton: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4caf50',
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: '#f1f8f4',
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  addButtonText: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  errorText: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 13,
  },
});

export default Addresses;
