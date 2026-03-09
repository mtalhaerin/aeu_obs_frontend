export const UserTexts = {
  // Page titles and headers
  pageTitle: "Kullanıcı Yönetimi",
  newUserTitle: "Yeni Kullanıcı",
  editUserTitle: "Kullanıcı Düzenle",
  profileTitle: "Özlük Bilgileri",
  userInfoTitle: "Kullanıcı Bilgileri",

  // User types
  userTypes: {
    student: "Öğrenci",
    academic: "Akademisyen",
    personnel: "Personel",
    unknown: "Bilinmeyen",
  },

  // Default values
  defaults: {
    studentSicil: "222511000",
    academicSicil: "AKD003",
    personnelSicil: "PRS002",
    defaultEmail: "ornek.ornek@ahievran.edu.tr",
  },

  // Search and filters
  search: {
    filtersTitle: "Arama Filtreleri",
    searchButton: "Ara",
    refreshButton: "Yenile",
    addButton: "Yeni Kullanıcı",
    backButton: "Geri Dön",
    allTypes: "Tümü",
  },

  // Placeholders
  placeholders: {
    searchName: "Ad ara...",
    searchSurname: "Soyad ara...",
    searchSicil: "Sicil no ara...",
    enterName: "Adınızı giriniz",
    enterMiddleName: "Orta adınızı giriniz",
    enterSurname: "Soyadınızı giriniz",
    enterEmail: "@ahievran.edu.tr ile biten e-posta",
    enterSicil: "Geçerli sicil numarası giriniz",
  },

  // Form labels
  labels: {
    userType: "Kullanıcı Tipi *",
    name: "Ad",
    middleName: "Orta Ad",
    surname: "Soyad",
    institutionalEmail: "Kurum E-posta *",
    sicilNumber: "Kurum Sicil No *",
    fullName: "Ad Soyad:",
    email: "E-posta:",
    sicil: "Sicil No:",
    type: "Tür:",
  },

  // Table headers
  table: {
    fullName: "Ad Soyad",
    email: "E-posta",
    sicil: "Sicil No",
    type: "Tür",
    actions: "İşlemler",
  },

  // Action buttons
  actions: {
    edit: "Düzenle",
    profile: "Özlük",
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
    noData: "Kullanıcı bulunamadı",
    userNotSelected: "Kullanıcı seçilmedi",
    profileSubtitle:
      "Kullanıcının adres, telefon ve e-posta bilgilerini yönetin",
    totalUsers: (total: number, page: number) =>
      `Toplam ${total} kullanıcı - Sayfa ${page}`,
    emailCopied: "E-posta kopyalandı!",
    sicilCopied: "Sicil No kopyalandı!",
  },

  // Success messages
  success: {
    userCreated: "Kullanıcı başarıyla oluşturuldu.",
    userUpdated: "Kullanıcı başarıyla güncellendi.",
    userDeleted: "Kullanıcı silindi",
  },

  // Error messages
  errors: {
    general: "Hata",
    loadUsersError: "Kullanıcılar yüklenirken hata oluştu.",
    createUserError: "Kullanıcı oluşturulurken hata oluştu.",
    updateUserError: "Kullanıcı güncellenirken hata oluştu.",
    deleteUserError: "Silme işlemi başarısız",
    userNotFoundForEdit: "Düzenlenecek kullanıcı bulunamadı.",
    fillAllFields: "Lütfen tüm alanları doğru şekilde doldurunuz.",
    validEmailRequired: "Geçerli bir @ahievran.edu.tr e-posta adresi giriniz",
    changeSicilRequired: "Varsayılan sicil numarasını değiştirmelisiniz",
  },

  // Copy messages
  copy: (label: string) => `${label} kopyalandı!`,
  sendMail: "Mail gönder",
} as const;
