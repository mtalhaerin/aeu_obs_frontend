export const MinorTexts = {
  pageTitle: "Bölüm Yönetimi",
  newMinorTitle: "Yeni Bölüm",
  editMinorTitle: "Bölüm Düzenle",
  minorInfoTitle: "Bölüm Bilgileri",

  search: {
    filtersTitle: "Arama Filtreleri",
    searchButton: "Ara",
    refreshButton: "Yenile",
    addButton: "Yeni Bölüm",
    backButton: "Geri Dön",
  },

  placeholders: {
    searchName: "Bölüm adı ara...",
    enterName: "Bölüm adını giriniz",
    enterFoundedDate: "Kuruluş tarihi (örn: 2000-01-01T00:00:00Z)",
    selectMajor: "Ana dal seçiniz",
  },

  labels: {
    minorName: "Bölüm Adı *",
    major: "Ana Dal *",
    foundedDate: "Kuruluş Tarihi",
    name: "Bölüm:",
    majorLabel: "Ana Dal:",
    founded: "Kuruluş:",
  },

  table: {
    name: "Bölüm Adı",
    major: "Ana Dal",
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
    noData: "Bölüm bulunamadı",
    loadingMajors: "Ana dallar yükleniyor...",
    totalMinors: (total: number, page: number) =>
      `Toplam ${total} bölüm - Sayfa ${page}`,
  },

  success: {
    minorCreated: "Bölüm başarıyla oluşturuldu.",
    minorUpdated: "Bölüm başarıyla güncellendi.",
    minorDeleted: "Bölüm silindi.",
  },

  errors: {
    general: "Hata",
    loadMinorsError: "Bölümler yüklenirken hata oluştu.",
    loadMajorsError: "Ana dallar yüklenirken hata oluştu.",
    createMinorError: "Bölüm oluşturulurken hata oluştu.",
    updateMinorError: "Bölüm güncellenirken hata oluştu.",
    deleteMinorError: "Silme işlemi başarısız.",
    minorNotFoundForEdit: "Düzenlenecek bölüm bulunamadı.",
    fillAllFields: "Lütfen tüm gerekli alanları doldurunuz.",
  },

  copy: (label: string) => `${label} kopyalandı!`,

  validation: {
    nameMin: "Bölüm adı en az 2 karakter olmalıdır",
    majorRequired: "Ana dal seçimi zorunludur",
  },
} as const;
