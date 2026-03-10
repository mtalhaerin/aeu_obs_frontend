export const MajorTexts = {
  pageTitle: "Bölüm Yönetimi",
  newMajorTitle: "Yeni Bölüm",
  editMajorTitle: "Bölüm Düzenle",
  majorInfoTitle: "Bölüm Bilgileri",

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
    selectFaculty: "Fakülte seçiniz",
  },

  labels: {
    majorName: "Bölüm Adı *",
    faculty: "Fakülte *",
    foundedDate: "Kuruluş Tarihi",
    name: "Bölüm:",
    facultyLabel: "Fakülte:",
    founded: "Kuruluş:",
  },

  table: {
    name: "Bölüm Adı",
    faculty: "Fakülte",
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
    loadingFaculties: "Fakülteler yükleniyor...",
    totalMajors: (total: number, page: number) =>
      `Toplam ${total} bölüm - Sayfa ${page}`,
  },

  success: {
    majorCreated: "Bölüm başarıyla oluşturuldu.",
    majorUpdated: "Bölüm başarıyla güncellendi.",
    majorDeleted: "Bölüm silindi.",
  },

  errors: {
    general: "Hata",
    loadMajorsError: "Bölümler yüklenirken hata oluştu.",
    loadFacultiesError: "Fakülteler yüklenirken hata oluştu.",
    createMajorError: "Bölüm oluşturulurken hata oluştu.",
    updateMajorError: "Bölüm güncellenirken hata oluştu.",
    deleteMajorError: "Silme işlemi başarısız.",
    majorNotFoundForEdit: "Düzenlenecek bölüm bulunamadı.",
    fillAllFields: "Lütfen tüm gerekli alanları doldurunuz.",
  },

  copy: (label: string) => `${label} kopyalandı!`,

  validation: {
    nameMin: "Bölüm adı en az 2 karakter olmalıdır",
    facultyRequired: "Fakülte seçimi zorunludur",
  },
} as const;
