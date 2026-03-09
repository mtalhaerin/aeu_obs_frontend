export const ProfileTexts = {
  pageTitle: "Kişisel Bilgiler",
  subtitle:
    "Adresleriniz, telefon numaralarınız ve e-posta adreslerinizi yönetin",
  loading: "Yükleniyor...",
  authorizedType: (type: string) => `Yetkili Tür: ${type}`,
  sections: {
    addresses: "Adresler",
    phones: "Telefonlar",
    emails: "E-postalar",
  },
} as const;
