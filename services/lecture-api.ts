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

interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  statusCode: number;
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

  console.log(`API Call: ${method} ${endpoint}`, body ? { body } : "");

  const response = await fetch(endpoint, options);

  const responseText = await response.text();
  let responseData: any;
  try {
    responseData = JSON.parse(responseText);
  } catch (e) {
    responseData = {};
  }

  if (!response.ok) {
    console.error(`API Error: ${response.status}`, responseData);
    throw new Error(
      responseData.message || `İşlem başarısız: ${response.status}`,
    );
  }

  if (responseData && responseData.isSuccess === false) {
    console.error("API Response Error:", responseData);
    throw new Error(responseData.message || "İşlem başarısız");
  }

  return responseData.data;
}

// LECTURE INTERFACES
export interface Lecture {
  dersUuid: string;
  dersKodu: string;
  dersAdi: string;
  aciklama: string | null;
  haftalikDersSaati: number;
  kredi: number;
  akts: number;
  olusturmaTarihi?: string;
  guncellemeTarihi?: string;
}

export interface LectureCreateRequest {
  dersKodu: string;
  dersAdi: string;
  aciklama: string | null;
  haftalikDersSaati: number;
  kredi: number;
  akts: number;
}

export interface LectureUpdateRequest extends LectureCreateRequest {
  dersUuid: string;
}

export interface LectureDeleteRequest {
  dersUuid: string;
}

export interface GetLecturesParams {
  dersKodu?: string;
  dersAdi?: string;
  kredi?: number;
  akts?: number;
  page?: number;
  pageSize?: number;
  olusturmaTarihi?: string;
  guncellemeTarihi?: string;
}

export interface GetLecturesResponse {
  data: Lecture[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// LECTURE API
export const lectureAPI = {
  async getLectures(
    params: GetLecturesParams = {},
  ): Promise<GetLecturesResponse> {
    const queryParams = new URLSearchParams();

    // Add only defined parameters to query string
    if (params.dersKodu) {
      queryParams.append("DersKodu", params.dersKodu);
    }
    if (params.dersAdi) {
      queryParams.append("DersAdi", params.dersAdi);
    }
    if (params.kredi !== undefined) {
      queryParams.append("Kredi", params.kredi.toString());
    }
    if (params.akts !== undefined) {
      queryParams.append("Akts", params.akts.toString());
    }
    if (params.olusturmaTarihi) {
      queryParams.append("OlusturmaTarihi", params.olusturmaTarihi);
    }
    if (params.guncellemeTarihi) {
      queryParams.append("GuncellemeTarihi", params.guncellemeTarihi);
    }
    if (params.page !== undefined) {
      queryParams.append("Page", params.page.toString());
    }
    if (params.pageSize !== undefined) {
      queryParams.append("PageSize", params.pageSize.toString());
    }

    const endpoint = `/api/Lecture/lectures${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

    try {
      const response = await apiCall<any>(endpoint, "GET");

      console.log("Lectures API Response:", response);

      // API response structure: { dersler: [...] }
      let lecturesData = response.dersler || [];

      // Ensure lecturesData is always an array
      if (!Array.isArray(lecturesData)) {
        console.warn("Lectures data is not an array:", lecturesData);
        lecturesData = [];
      }

      return {
        data: lecturesData,
        total: lecturesData.length, // API doesn't provide total count yet
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        totalPages: Math.ceil(lecturesData.length / (params.pageSize || 20)),
      };
    } catch (error) {
      console.error("Error fetching lectures:", error);
      // Return empty result instead of throwing to prevent crashes
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        totalPages: 0,
      };
    }
  },

  async getLecture(dersUuid: string): Promise<Lecture> {
    const endpoint = `/api/Lecture/lecture?DersUuid=${encodeURIComponent(dersUuid)}`;
    return apiCall<Lecture>(endpoint, "GET");
  },

  async createLecture(data: LectureCreateRequest): Promise<Lecture> {
    return apiCall<Lecture>("/api/Lecture/lecture", "POST", data);
  },

  async updateLecture(data: LectureUpdateRequest): Promise<Lecture> {
    return apiCall<Lecture>("/api/Lecture/lecture", "PUT", data);
  },

  async deleteLecture(dersUuid: string): Promise<void> {
    console.log("deleteLecture called with UUID:", dersUuid);
    const deleteData: LectureDeleteRequest = { dersUuid };
    console.log("Sending DELETE request with body:", deleteData);
    return apiCall<void>("/api/Lecture/lecture", "DELETE", deleteData);
  },
};
