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

// FACULTY INTERFACES
export interface Faculty {
  fakulteUuid: string;
  fakulteAdi: string;
  webAdres: string | null;
  kurulusTarihi: string | null;
  olusturmaTarihi?: string;
  guncellemeTarihi?: string;
}

export interface FacultyCreateRequest {
  fakulteAdi: string;
  webAdres: string | null;
  kurulusTarihi: string | null;
}

export interface FacultyUpdateRequest extends FacultyCreateRequest {
  fakulteUuid: string;
}

export interface GetFacultiesParams {
  fakulteAdi?: string;
  webAdres?: string;
  kurulusTarihi?: string;
  olusturmaTarihi?: string;
  guncellemeTarihi?: string;
  page?: number;
  pageSize?: number;
}

export interface GetFacultiesResponse {
  data: Faculty[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// FACULTY API
export const facultyAPI = {
  async getFaculties(
    params: GetFacultiesParams = {},
  ): Promise<GetFacultiesResponse> {
    const queryParams = new URLSearchParams();

    if (params.fakulteAdi) queryParams.append("FakulteAdi", params.fakulteAdi);
    if (params.webAdres) queryParams.append("WebAdres", params.webAdres);
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

    const endpoint = `/api/Faculty/faculties${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

    try {
      const response = await apiCall<any>(endpoint, "GET");

      let facultiesData =
        response.fakulteler || response.data || response || [];
      if (!Array.isArray(facultiesData)) facultiesData = [];

      return {
        data: facultiesData,
        total: facultiesData.length,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        totalPages: Math.ceil(facultiesData.length / (params.pageSize || 20)),
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

  async createFaculty(data: FacultyCreateRequest): Promise<any> {
    return await apiCall<any>("/api/Faculty/faculty", "POST", data);
  },

  async updateFaculty(data: FacultyUpdateRequest): Promise<any> {
    return await apiCall<any>("/api/Faculty/faculty", "PUT", data);
  },

  async deleteFaculty(fakulteUuid: string): Promise<any> {
    return await apiCall<any>("/api/Faculty/faculty", "DELETE", { fakulteUuid });
  },
};
