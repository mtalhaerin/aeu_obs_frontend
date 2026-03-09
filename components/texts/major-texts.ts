export const MajorTexts = {
  pageTitle: "Ana Dal Yönetimi",
  newMajorTitle: "Yeni Ana Dal",
  editMajorTitle: "Ana Dal Düzenle",
  majorInfoTitle: "Ana Dal Bilgileri",

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
    selectFaculty: "Fakülte seçiniz",
  },

  labels: {
    majorName: "Ana Dal Adı *",
    faculty: "Fakülte *",
    foundedDate: "Kuruluş Tarihi",
    name: "Ana Dal:",
    facultyLabel: "Fakülte:",
    founded: "Kuruluş:",
  },

  table: {
    name: "Ana Dal Adı",
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
    noData: "Ana dal bulunamadı",
    loadingFaculties: "Fakülteler yükleniyor...",
    totalMajors: (total: number, page: number) =>
      `Toplam ${total} ana dal - Sayfa ${page}`,
  },

  success: {
    majorCreated: "Ana dal başarıyla oluşturuldu.",
    majorUpdated: "Ana dal başarıyla güncellendi.",
    majorDeleted: "Ana dal silindi.",
  },

  errors: {
    general: "Hata",
    loadMajorsError: "Ana dallar yüklenirken hata oluştu.",
    loadFacultiesError: "Fakülteler yüklenirken hata oluştu.",
    createMajorError: "Ana dal oluşturulurken hata oluştu.",
    updateMajorError: "Ana dal güncellenirken hata oluştu.",
    deleteMajorError: "Silme işlemi başarısız.",
    majorNotFoundForEdit: "Düzenlenecek ana dal bulunamadı.",
    fillAllFields: "Lütfen tüm gerekli alanları doldurunuz.",
  },

  copy: (label: string) => `${label} kopyalandı!`,

  validation: {
    nameMin: "Ana dal adı en az 2 karakter olmalıdır",
    facultyRequired: "Fakülte seçimi zorunludur",
  },
} as const;
