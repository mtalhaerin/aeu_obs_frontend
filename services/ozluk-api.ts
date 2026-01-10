import Constants from 'expo-constants';
import { getCookie } from '../utils/cookies';

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:5249';

// Response wrapper interface
interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

// Helper function to get auth token from cookie
function getAuthToken(): string | null {
  return getCookie('accessToken');
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any
): Promise<T> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Yetkilendirme başarısız. Lütfen tekrar giriş yapınız.');
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `İşlem başarısız: ${response.status}`);
  }

  const responseData: ApiResponse<T> = await response.json();
  
  if (!responseData.isSuccess) {
    throw new Error(responseData.message || 'İşlem başarısız');
  }

  return responseData.data;
}

// ADDRESS API
export interface OzlukAdres {
  adresUuid: string;
  sokak: string;
  sehir: string;
  ilce: string;
  postaKodu: string;
  ulke: string;
  oncelikli: boolean;
}

export interface AddresAddRequest {
  sokak: string;
  sehir: string;
  ilce: string;
  postaKodu: string;
  ulke: string;
  oncelikli: boolean;
}

export interface AddresUpdateRequest extends AddresAddRequest {
  adresUuid: string;
}

export interface AddresDeleteRequest {
  adresUuid: string;
}

export const addressAPI = {
  async getAddresses(): Promise<OzlukAdres[]> {
    const response = await apiCall<any>('/api/Ozluk/addreses', 'GET');
    // API döndürebilecek yapılar: { addreses: [...] } veya { addresses: [...] } vb (typo)
    return response?.addreses || response?.addresses || response?.adreses || [];
  },

  async getAddress(adresUuid: string): Promise<OzlukAdres> {
    return apiCall(`/api/Ozluk/addres/${adresUuid}`, 'GET');
  },

  async addAddress(data: AddresAddRequest): Promise<OzlukAdres> {
    return apiCall('/api/Ozluk/addres', 'POST', data);
  },

  async updateAddress(data: AddresUpdateRequest): Promise<OzlukAdres> {
    return apiCall('/api/Ozluk/addres', 'PUT', data);
  },

  async deleteAddress(adresUuid: string): Promise<void> {
    return apiCall('/api/Ozluk/addres', 'DELETE', { adresUuid });
  },
};

// EMAIL API
export interface OzlukEmail {
  epostaUuid: string;
  epostaAdresi: string;
  epostaTipi: string;
  oncelikli: boolean;
}

export interface EmailAddRequest {
  epostaAdresi: string;
  epostaTipi: 'KURUMSAL' | 'KISISEL' | 'DIGER';
  oncelikli: boolean;
}

export interface EmailUpdateRequest extends EmailAddRequest {
  epostaUuid: string;
}

export interface EmailDeleteRequest {
  epostaUuid: string;
}

export const emailAPI = {
  async getEmails(): Promise<OzlukEmail[]> {
    const response = await apiCall<any>('/api/Ozluk/emails', 'GET');
    // API döndürebilecek yapılar: { emails: [...] } veya { epostalar: [...] } vb
    return response?.emails || response?.epostalar || response?.mails || [];
  },

  async getEmail(epostaUuid: string): Promise<OzlukEmail> {
    return apiCall(`/api/Ozluk/email/${epostaUuid}`, 'GET');
  },

  async addEmail(data: EmailAddRequest): Promise<OzlukEmail> {
    return apiCall('/api/Ozluk/email', 'POST', data);
  },

  async updateEmail(data: EmailUpdateRequest): Promise<OzlukEmail> {
    return apiCall('/api/Ozluk/email', 'PUT', data);
  },

  async deleteEmail(epostaUuid: string): Promise<void> {
    return apiCall('/api/Ozluk/email', 'DELETE', { epostaUuid });
  },
};

// PHONE API
export interface OzlukTelefon {
  telefonUuid: string;
  ulkeKodu: string;
  telefonNo: string;
  telefonTipi: string;
  oncelikli: boolean;
}

export interface PhoneAddRequest {
  ulkeKodu: string;
  telefonNo: string;
  telefonTipi: 'CEP' | 'EV' | 'IS' | 'DIGER';
  oncelikli: boolean;
}

export interface PhoneUpdateRequest extends PhoneAddRequest {
  telefonUuid: string;
}

export interface PhoneDeleteRequest {
  telefonUuid: string;
}

export const phoneAPI = {
  async getPhones(): Promise<OzlukTelefon[]> {
    const response = await apiCall<any>('/api/Ozluk/phones', 'GET');
    // API döndürebilecek yapılar: { phones: [...] } veya { telefonlar: [...] } vb
    return response?.phones || response?.telefonlar || response?.telefons || [];
  },

  async getPhone(telefonUuid: string): Promise<OzlukTelefon> {
    return apiCall(`/api/Ozluk/phone/${telefonUuid}`, 'GET');
  },

  async addPhone(data: PhoneAddRequest): Promise<OzlukTelefon> {
    return apiCall('/api/Ozluk/phone', 'POST', data);
  },

  async updatePhone(data: PhoneUpdateRequest): Promise<OzlukTelefon> {
    return apiCall('/api/Ozluk/phone', 'PUT', data);
  },

  async deletePhone(telefonUuid: string): Promise<void> {
    return apiCall('/api/Ozluk/phone', 'DELETE', { telefonUuid });
  },
};
