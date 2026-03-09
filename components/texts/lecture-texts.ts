export const LectureTexts = {
  // Page titles and headers
  pageTitle: "Ders Yönetimi",
  newLectureTitle: "Yeni Ders",
  editLectureTitle: "Ders Düzenle",
  lectureInfoTitle: "Ders Bilgileri",

  // Search and filters
  search: {
    filtersTitle: "Arama Filtreleri",
    searchButton: "Ara",
    refreshButton: "Yenile",
    addButton: "Yeni Ders",
    backButton: "Geri Dön",
  },

  // Placeholders
  placeholders: {
    searchCode: "Ders kodu ara...",
    searchName: "Ders adı ara...",
    enterCode: "Ders kodunu giriniz (örn: COMP101)",
    enterName: "Ders adını giriniz",
    enterDescription: "Ders açıklamasını giriniz (opsiyonel)",
    enterWeeklyHours: "Haftalık ders saati",
    enterCredit: "Kredi değerini giriniz",
    enterEcts: "AKTS kredisini giriniz",
  },

  // Form labels
  labels: {
    lectureCode: "Ders Kodu *",
    lectureName: "Ders Adı *",
    description: "Açıklama",
    weeklyHours: "Haftalık Ders Saati *",
    credit: "Kredi *",
    ects: "AKTS *",
    code: "Kod:",
    name: "Ders:",
    weekly: "Saat/Hafta:",
    creditShort: "Kredi:",
    ectsShort: "AKTS:",
    desc: "Açıklama:",
  },

  // Table headers
  table: {
    code: "Ders Kodu",
    name: "Ders Adı", 
    credit: "Kredi",
    ects: "AKTS",
    weeklyHours: "S/Hafta",
    actions: "İşlemler",
  },

  // Action buttons
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

  // Messages
  messages: {
    loading: "Yükleniyor...",
    noData: "Ders bulunamadı",
    lectureNotSelected: "Ders seçilmedi",
    totalLectures: (total: number, page: number) =>
      `Toplam ${total} ders - Sayfa ${page}`,
    codeCopied: "Ders kodu kopyalandı!",
    nameCopied: "Ders adı kopyalandı!",
  },

  // Success messages
  success: {
    lectureCreated: "Ders başarıyla oluşturuldu.",
    lectureUpdated: "Ders başarıyla güncellendi.",
    lectureDeleted: "Ders silindi",
  },

  // Error messages
  errors: {
    general: "Hata",
    loadLecturesError: "Dersler yüklenirken hata oluştu.",
    createLectureError: "Ders oluşturulurken hata oluştu.",
    updateLectureError: "Ders güncellenirken hata oluştu.",
    deleteLectureError: "Silme işlemi başarısız",
    lectureNotFoundForEdit: "Düzenlenecek ders bulunamadı.",
    fillAllFields: "Lütfen tüm gerekli alanları doldurunuz.",
    validCodeRequired: "Geçerli bir ders kodu giriniz",
    validNameRequired: "Ders adı boş bırakılamaz",
    validCreditRequired: "Kredi 1-10 arası olmalıdır",
    validEctsRequired: "AKTS 1-30 arası olmalıdır",
    validHoursRequired: "Haftalık ders saati 1-20 arası olmalıdır",
  },

  // Copy messages
  copy: (label: string) => `${label} kopyalandı!`,

  // Validation messages
  validation: {
    codePattern: "Ders kodu en az 3 karakter olmalıdır",
    nameMin: "Ders adı en az 3 karakter olmalıdır",
    creditRange: "Kredi 1-10 arası olmalıdır",
    ectsRange: "AKTS 1-30 arası olmalıdır",
    hoursRange: "Haftalık ders saati 1-20 arası olmalıdır",
  },
} as const;