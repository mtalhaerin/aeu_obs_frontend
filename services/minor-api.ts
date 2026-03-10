import ApiConfig from "../utils/api-config";
import { getCookie } from "../utils/cookies";

function buildUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;

  let base = ApiConfig.baseUrl || "";
  base = base.replace(/\/+$/g, "");

  let ep = endpoint || "";
  ep = "/" + ep.replace(/^\/+/, "");

  if (
    base.toLowerCase().endsWith("/api") &&
    ep.toLowerCase().startsWith("/api")
  ) {
    ep = ep.replace(/^\/api/i, "");
    if (!ep.startsWith("/")) ep = "/" + ep;
  }

  return base + ep;
}

function getAuthToken(): string | null {
  return getCookie("accessToken");
}

async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: any,
): Promise<T> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Yetkilendirme başarısız. Lütfen tekrar giriş yapınız.");
  }

  endpoint = buildUrl(endpoint);

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

  const responseText = await response.text();
  let responseData: any;
  try {
    responseData = JSON.parse(responseText);
  } catch (e) {
    responseData = {};
  }

  if (!response.ok) {
    throw new Error(
      responseData.message || `İşlem başarısız: ${response.status}`,
    );
  }

  if (responseData && responseData.isSuccess === false) {
    throw new Error(responseData.message || "İşlem başarısız");
  }

  return responseData.data !== undefined ? responseData.data : responseData;
}

// MINOR INTERFACES
export interface Minor {
  anaDalUuid: string;
  anaDalAdi: string;
  bolumUuid: string;
  kurulusTarihi: string | null;
  olusturmaTarihi?: string;
  guncellemeTarihi?: string;
}

export interface MinorCreateRequest {
  anaDalAdi: string;
  bolumUuid: string;
  kurulusTarihi: string | null;
}

export interface MinorUpdateRequest extends MinorCreateRequest {
  anaDalUuid: string;
}

export interface GetMinorsParams {
  anaDalAdi?: string;
  bolumUuid?: string;
  kurulusTarihi?: string;
  olusturmaTarihi?: string;
  guncellemeTarihi?: string;
  page?: number;
  pageSize?: number;
}

export interface GetMinorsResponse {
  data: Minor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// MINOR API
export const minorAPI = {
  async getMinors(params: GetMinorsParams = {}): Promise<GetMinorsResponse> {
    const queryParams = new URLSearchParams();

    if (params.anaDalAdi) queryParams.append("AnaDalAdi", params.anaDalAdi);
    if (params.bolumUuid) queryParams.append("BolumUuid", params.bolumUuid);
    if (params.kurulusTarihi)
      queryParams.append("KurulusTarihi", params.kurulusTarihi);
    if (params.olusturmaTarihi)
      queryParams.append("OlusturmaTarihi", params.olusturmaTarihi);
    if (params.guncellemeTarihi)
      queryParams.append("GuncellemeTarihi", params.guncellemeTarihi);
    if (params.page !== undefined)
      queryParams.append("Page", params.page.toString());
    if (params.pageSize !== undefined)
      queryParams.append("PageSize", params.pageSize.toString());

    const endpoint = `/api/Minor/minors${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

    try {
      const response = await apiCall<any>(endpoint, "GET");

      let minorsData =
        response.anaDallar ||
        response.bolumler ||
        response.data ||
        response ||
        [];
      if (!Array.isArray(minorsData)) minorsData = [];

      return {
        data: minorsData,
        total: minorsData.length,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        totalPages: Math.ceil(minorsData.length / (params.pageSize || 20)),
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        totalPages: 0,
      };
    }
  },

  async createMinor(data: MinorCreateRequest): Promise<any> {
    return await apiCall<any>("/api/Minor/minor", "POST", data);
  },

  async updateMinor(data: MinorUpdateRequest): Promise<any> {
    return await apiCall<any>("/api/Minor/minor", "PUT", data);
  },

  async deleteMinor(anaDalUuid: string): Promise<any> {
    return await apiCall<any>("/api/Minor/minor", "DELETE", { anaDalUuid });
  },
};
