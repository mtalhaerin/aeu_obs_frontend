export const MinorTexts = {
  pageTitle: "Ana Dal Yönetimi",
  newMinorTitle: "Yeni Ana Dal",
  editMinorTitle: "Ana Dal Düzenle",
  minorInfoTitle: "Ana Dal Bilgileri",

  search: {
    filtersTitle: "Arama Filtreleri",
    searchButton: "Ara",
    refreshButton: "Yenile",
    addButton: "Yeni Ana Dal",
    backButton: "Geri Dön",
  },

  placeholders: {
    searchName: "Ana dal adı ara...",
    enterName: "Ana dal adını giriniz",
    enterFoundedDate: "Kuruluş tarihi (örn: 2000-01-01T00:00:00Z)",
    selectMajor: "Bölüm seçiniz",
  },

  labels: {
    minorName: "Ana Dal Adı *",
    major: "Bölüm *",
    foundedDate: "Kuruluş Tarihi",
    name: "Ana Dal:",
    majorLabel: "Bölüm:",
    founded: "Kuruluş:",
  },

  table: {
    name: "Ana Dal Adı",
    major: "Bölüm",
    foundedDate: "Kuruluş Tarihi",
    actions: "İşlemler",
  },

  actions: {
    edit: "Düzenle",
    view: "Görüntüle",
    delete: "Sil",
    create: "Oluştur",
    update: "Güncelle",
    cancel: "İptal",
    previous: "Önceki",
    next: "Sonraki",
  },

  messages: {
    loading: "Yükleniyor...",
    noData: "Ana dal bulunamadı",
    loadingMajors: "Bölümler yükleniyor...",
    totalMinors: (total: number, page: number) =>
      `Toplam ${total} ana dal - Sayfa ${page}`,
  },

  success: {
    minorCreated: "Ana dal başarıyla oluşturuldu.",
    minorUpdated: "Ana dal başarıyla güncellendi.",
    minorDeleted: "Ana dal silindi.",
  },

  errors: {
    general: "Hata",
    loadMinorsError: "Ana dallar yüklenirken hata oluştu.",
    loadMajorsError: "Bölümler yüklenirken hata oluştu.",
    createMinorError: "Ana dal oluşturulurken hata oluştu.",
    updateMinorError: "Ana dal güncellenirken hata oluştu.",
    deleteMinorError: "Silme işlemi başarısız.",
    minorNotFoundForEdit: "Düzenlenecek ana dal bulunamadı.",
    fillAllFields: "Lütfen tüm gerekli alanları doldurunuz.",
  },

  copy: (label: string) => `${label} kopyalandı!`,

  validation: {
    nameMin: "Ana dal adı en az 2 karakter olmalıdır",
    majorRequired: "Bölüm seçimi zorunludur",
  },
} as const;
