/**
 * Kullanıcı kimlik türleri
 * JWT token'ındaki identity_type payload'unda kullanılır
 */
export enum IdentityType {
  OGRENCI = 'OGRENCI',
  PERSONEL = 'PERSONEL',
  AKADEMISYEN = 'AKADEMISYEN',
}

/**
 * Identity type'ın display name'i
 */
export const IdentityTypeLabels: Record<IdentityType, string> = {
  [IdentityType.OGRENCI]: 'Öğrenci',
  [IdentityType.PERSONEL]: 'Personel',
  [IdentityType.AKADEMISYEN]: 'Akademisyen',
};
