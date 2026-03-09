export const FacultyTexts = {
  pageTitle: "Fakülte Yönetimi",
  newFacultyTitle: "Yeni Fakülte",
  editFacultyTitle: "Fakülte Düzenle",
  facultyInfoTitle: "Fakülte Bilgileri",

  search: {
    filtersTitle: "Arama Filtreleri",
    searchButton: "Ara",
    refreshButton: "Yenile",
    addButton: "Yeni Fakülte",
    backButton: "Geri Dön",
  },

  placeholders: {
    searchName: "Fakülte adı ara...",
    searchWebAddress: "Web adresi ara...",
    enterName: "Fakülte adını giriniz",
    enterWebAddress: "Web adresini giriniz (opsiyonel)",
    enterFoundedDate: "Kuruluş tarihi (örn: 2000-01-01T00:00:00Z)",
  },

  labels: {
    facultyName: "Fakülte Adı *",
    webAddress: "Web Adresi",
    foundedDate: "Kuruluş Tarihi",
    name: "Fakülte:",
    web: "Web:",
    founded: "Kuruluş:",
  },

  table: {
    name: "Fakülte Adı",
    webAddress: "Web Adresi",
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
    noData: "Fakülte bulunamadı",
    totalFaculties: (total: number, page: number) =>
      `Toplam ${total} fakülte - Sayfa ${page}`,
  },

  success: {
    facultyCreated: "Fakülte başarıyla oluşturuldu.",
    facultyUpdated: "Fakülte başarıyla güncellendi.",
    facultyDeleted: "Fakülte silindi.",
  },

  errors: {
    general: "Hata",
    loadFacultiesError: "Fakülteler yüklenirken hata oluştu.",
    createFacultyError: "Fakülte oluşturulurken hata oluştu.",
    updateFacultyError: "Fakülte güncellenirken hata oluştu.",
    deleteFacultyError: "Silme işlemi başarısız.",
    facultyNotFoundForEdit: "Düzenlenecek fakülte bulunamadı.",
    fillAllFields: "Lütfen tüm gerekli alanları doldurunuz.",
  },

  copy: (label: string) => `${label} kopyalandı!`,

  validation: {
    nameMin: "Fakülte adı en az 2 karakter olmalıdır",
  },
} as const;
