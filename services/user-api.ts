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

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`API Error: ${response.status}`, errorData);
    throw new Error(errorData.message || `İşlem başarısız: ${response.status}`);
  }

  const responseData: ApiResponse<T> = await response.json();

  if (!responseData.isSuccess) {
    console.error("API Response Error:", responseData);
    throw new Error(responseData.message || "İşlem başarısız");
  }

  return responseData.data;
}

// USER INTERFACES
export interface User {
  kullaniciUuid: string;
  kullaniciTipi: number;
  ad: string | null;
  ortaAd: string | null;
  soyad: string | null;
  kurumEposta: string;
  kurumSicilNo: string;
  olusturmaTarihi?: string;
  guncellemeTarihi?: string;
}

export interface UserCreateRequest {
  kullaniciTipi: number;
  ad: string | null;
  ortaAd: string | null;
  soyad: string | null;
  kurumEposta: string;
  kurumSicilNo: string;
}

export interface UserUpdateRequest extends UserCreateRequest {
  kullaniciUuid: string;
}

export interface UserDeleteRequest {
  kullaniciUuid: string;
}

export interface GetUsersParams {
  kullaniciTipi?: number;
  ad?: string;
  ortaAd?: string;
  soyad?: string;
  kurumEposta?: string;
  kurumSicilNo?: string;
  olusturmaTarihi?: string;
  guncellemeTarihi?: string;
  page?: number;
  pageSize?: number;
}

export interface GetUsersResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// USER API
export const userAPI = {
  async getUsers(params: GetUsersParams = {}): Promise<GetUsersResponse> {
    const queryParams = new URLSearchParams();

    // Add only defined parameters to query string
    if (params.kullaniciTipi !== undefined) {
      queryParams.append("KullaniciTipi", params.kullaniciTipi.toString());
    }
    if (params.ad) {
      queryParams.append("Ad", params.ad);
    }
    if (params.ortaAd) {
      queryParams.append("OrtaAd", params.ortaAd);
    }
    if (params.soyad) {
      queryParams.append("Soyad", params.soyad);
    }
    if (params.kurumEposta) {
      queryParams.append("KurumEposta", params.kurumEposta);
    }
    if (params.kurumSicilNo) {
      queryParams.append("KurumSicilNo", params.kurumSicilNo);
    }
    if (params.olusturmaTarihi) {
      queryParams.append("OlusturmaTarihi", params.olusturmaTarihi);
    }
    if (params.guncellemeTarihi) {
      queryParams.append("GuncellemeTarihi", params.guncellemeTarihi);
    }
    if (params.page !== undefined) {
      queryParams.append("page", params.page.toString());
    }
    if (params.pageSize !== undefined) {
      queryParams.append("pageSize", params.pageSize.toString());
    }

    const endpoint = `/api/User/users${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

    try {
      const response = await apiCall<any>(endpoint, "GET");

      // API response might be directly an array or wrapped in an object
      // Adjust based on actual API response structure
      if (Array.isArray(response)) {
        return {
          data: response,
          total: response.length,
          page: params.page || 1,
          pageSize: params.pageSize || 20,
          totalPages: Math.ceil(response.length / (params.pageSize || 20)),
        };
      }

      // If it's an object with data property
      return {
        data: response.users || response.data || response,
        total:
          response.total ||
          response.totalCount ||
          (response.users || response.data || response).length,
        page: response.page || params.page || 1,
        pageSize: response.pageSize || params.pageSize || 20,
        totalPages:
          response.totalPages ||
          Math.ceil(
            (response.total || response.totalCount || 0) /
              (params.pageSize || 20),
          ),
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  async getUser(kullaniciUuid: string): Promise<User> {
    const endpoint = `/api/User/user?KullaniciUuid=${encodeURIComponent(kullaniciUuid)}`;
    return apiCall<User>(endpoint, "GET");
  },

  async createUser(data: UserCreateRequest): Promise<User> {
    return apiCall<User>("/api/User/user", "POST", data);
  },

  async updateUser(data: UserUpdateRequest): Promise<User> {
    return apiCall<User>("/api/User/user", "PUT", data);
  },

  async deleteUser(kullaniciUuid: string): Promise<void> {
    console.log("deleteUser called with UUID:", kullaniciUuid);
    const deleteData: UserDeleteRequest = { kullaniciUuid };
    console.log("Sending DELETE request with body:", deleteData);
    return apiCall<void>("/api/User/user", "DELETE", deleteData);
  },
};
