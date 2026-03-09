import Constants from "expo-constants";
import { getCookie } from "../utils/cookies";
import { decodeJWT } from "../utils/jwt";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || "http://localhost:5249";

// Build full URL safely to avoid duplicate segments like `/api/api` or duplicate slashes.
function buildUrl(endpoint: string): string {
  // If endpoint is already an absolute URL, return it as-is
  if (/^https?:\/\//i.test(endpoint)) return endpoint;

  let base = API_BASE_URL || "";
  // remove trailing slashes from base
  base = base.replace(/\/+$/g, "");

  let ep = endpoint || "";
  // ensure endpoint starts with a single slash
  ep = "/" + ep.replace(/^\/+/, "");

  // if base already ends with '/api' and endpoint also starts with '/api', drop the duplicate '/api' from endpoint
  if (
    base.toLowerCase().endsWith("/api") &&
    ep.toLowerCase().startsWith("/api")
  ) {
    ep = ep.replace(/^\/api/i, "");
    if (!ep.startsWith("/")) ep = "/" + ep;
  }

  return base + ep;
}

// Response wrapper interface
interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  statusCode: number;
}

// Helper function to get auth token from cookie
function getAuthToken(): string | null {
  return getCookie("accessToken");
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: any,
  targetUserUuid?: string, // Admin panel için başka kullanıcının verileri
): Promise<T> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Yetkilendirme başarısız. Lütfen tekrar giriş yapınız.");
  }

  // targetUserUuid varsa onu kullan, yoksa token'dan userUuid'yi çıkar
  let userUuid = targetUserUuid;
  if (!userUuid) {
    const payload = decodeJWT(token);
    userUuid = payload?.sub;
  }

  // Build the full URL first for all request types
  endpoint = buildUrl(endpoint);

  if (method === "GET" && userUuid) {
    // Append userUuid to the query parameters for GET requests
    const url = new URL(endpoint);
    url.searchParams.append("kullaniciUuid", userUuid);
    endpoint = url.toString();
  } else if (
    userUuid &&
    (method === "POST" || method === "PUT" || method === "DELETE")
  ) {
    // targetUserUuid varsa body'de de o kullanıcının UUID'sini kullan
    if (typeof body === "object" && !Array.isArray(body)) {
      body.kullaniciUuid = userUuid;
    } else {
      body = { kullaniciUuid: userUuid };
    }
  }

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `İşlem başarısız: ${response.status}`);
  }

  const responseData: ApiResponse<T> = await response.json();

  if (!responseData.isSuccess) {
    throw new Error(responseData.message || "İşlem başarısız");
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
  kullaniciUuid?: string; // API call'da otomatik ekleniyor
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
  async getAddresses(targetUserUuid?: string): Promise<OzlukAdres[]> {
    const response = await apiCall<any>(
      "/api/Ozluk/addreses",
      "GET",
      null,
      targetUserUuid,
    );
    // API döndürebilecek yapılar: { addreses: [...] } veya { addresses: [...] } vb (typo)
    return response?.addreses || response?.addresses || response?.adreses || [];
  },

  async getAddress(
    adresUuid: string,
    targetUserUuid?: string,
  ): Promise<OzlukAdres> {
    return apiCall(
      `/api/Ozluk/addres/${adresUuid}`,
      "GET",
      null,
      targetUserUuid,
    );
  },

  async addAddress(
    data: AddresAddRequest,
    targetUserUuid?: string,
  ): Promise<OzlukAdres> {
    return apiCall("/api/Ozluk/addres", "POST", data, targetUserUuid);
  },

  async updateAddress(
    data: AddresUpdateRequest,
    targetUserUuid?: string,
  ): Promise<OzlukAdres> {
    return apiCall("/api/Ozluk/addres", "PUT", data, targetUserUuid);
  },

  async deleteAddress(
    adresUuid: string,
    targetUserUuid?: string,
  ): Promise<void> {
    return apiCall(
      "/api/Ozluk/addres",
      "DELETE",
      { adresUuid },
      targetUserUuid,
    );
  },
};

// EMAIL API
// Enum values from backend
export enum EpostaTipi {
  KISISEL = 0,
  IS = 1,
  DIGER = 2,
  Personel = 3,
}

export interface OzlukEmail {
  epostaUuid: string;
  epostaAdresi: string;
  epostaTipi: string;
  oncelikli: boolean;
}

export interface EmailAddRequest {
  epostaAdresi: string;
  epostaTipi: EpostaTipi;
  oncelikli: boolean;
}

export interface EmailUpdateRequest extends EmailAddRequest {
  epostaUuid: string;
}

export interface EmailDeleteRequest {
  epostaUuid: string;
}

export const emailAPI = {
  async getEmails(targetUserUuid?: string): Promise<OzlukEmail[]> {
    const response = await apiCall<any>(
      "/api/Ozluk/emails",
      "GET",
      null,
      targetUserUuid,
    );
    // API döndürebilecek yapılar: { emails: [...] } veya { epostalar: [...] } vb
    return response?.emails || response?.epostalar || response?.mails || [];
  },

  async getEmail(
    epostaUuid: string,
    targetUserUuid?: string,
  ): Promise<OzlukEmail> {
    return apiCall(
      `/api/Ozluk/email/${epostaUuid}`,
      "GET",
      null,
      targetUserUuid,
    );
  },

  async addEmail(
    data: EmailAddRequest,
    targetUserUuid?: string,
  ): Promise<OzlukEmail> {
    return apiCall("/api/Ozluk/email", "POST", data, targetUserUuid);
  },

  async updateEmail(
    data: EmailUpdateRequest,
    targetUserUuid?: string,
  ): Promise<OzlukEmail> {
    return apiCall("/api/Ozluk/email", "PUT", data, targetUserUuid);
  },

  async deleteEmail(
    epostaUuid: string,
    targetUserUuid?: string,
  ): Promise<void> {
    return apiCall(
      "/api/Ozluk/email",
      "DELETE",
      { epostaUuid },
      targetUserUuid,
    );
  },
};

// PHONE API
// Enum values from backend
export enum TelefonTipi {
  CEP = 0,
  EV = 1,
  IS = 2,
}

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
  telefonTipi: TelefonTipi;
  oncelikli: boolean;
}

export interface PhoneUpdateRequest extends PhoneAddRequest {
  telefonUuid: string;
}

export interface PhoneDeleteRequest {
  telefonUuid: string;
}

export const phoneAPI = {
  async getPhones(targetUserUuid?: string): Promise<OzlukTelefon[]> {
    const response = await apiCall<any>(
      "/api/Ozluk/phones",
      "GET",
      null,
      targetUserUuid,
    );
    // API döndürebilecek yapılar: { phones: [...] } veya { telefonlar: [...] } vb
    return response?.phones || response?.telefonlar || response?.telefons || [];
  },

  async getPhone(
    telefonUuid: string,
    targetUserUuid?: string,
  ): Promise<OzlukTelefon> {
    return apiCall(
      `/api/Ozluk/phone/${telefonUuid}`,
      "GET",
      null,
      targetUserUuid,
    );
  },

  async addPhone(
    data: PhoneAddRequest,
    targetUserUuid?: string,
  ): Promise<OzlukTelefon> {
    return apiCall("/api/Ozluk/phone", "POST", data, targetUserUuid);
  },

  async updatePhone(
    data: PhoneUpdateRequest,
    targetUserUuid?: string,
  ): Promise<OzlukTelefon> {
    return apiCall("/api/Ozluk/phone", "PUT", data, targetUserUuid);
  },

  async deletePhone(
    telefonUuid: string,
    targetUserUuid?: string,
  ): Promise<void> {
    return apiCall(
      "/api/Ozluk/phone",
      "DELETE",
      { telefonUuid },
      targetUserUuid,
    );
  },
};
