import { $api } from '@/services/api.service';
import {
  ApiPostSignInRequest,
  ApiPostSignInResponse,
  ApiUserBaseEntity,
  TPostSignUpRequest,
  TPostSignUpResponse,
} from '@/shared/api/contracts';
import { removeStorageRecloudIDAccessToken, setStorageProfile } from '@/shared/services';

class AuthService {
  private BASE_URL = '/users';

  // accessToken/refreshToken arrive as httpOnly cookies the browser stores automatically
  // ($api sends withCredentials); this JS layer never sees the raw token. The response body
  // carries the same claims decoded server-side, under `profile`, for UI purposes.
  async signUp(body: TPostSignUpRequest): Promise<TPostSignUpResponse> {
    const { data } = await $api.post<TPostSignUpResponse>(`${this.BASE_URL}/signup`, body);
    setStorageProfile(data.data.profile as ApiUserBaseEntity);

    return data;
  }

  async signIn(body: ApiPostSignInRequest): Promise<ApiPostSignInResponse> {
    const { data } = await $api.post<ApiPostSignInResponse>(`${this.BASE_URL}/signin`, body);
    setStorageProfile(data.data.profile as ApiUserBaseEntity);

    return data;
  }

  async refresh(): Promise<{ expiresIn: number }> {
    // The API returns ResponseMessage<AuthTokensDto>
    const { data } = await $api.get<{
      data: { expiresIn: number; profile: ApiUserBaseEntity };
    }>(`${this.BASE_URL}/refresh`);

    setStorageProfile(data.data.profile);

    return { expiresIn: data.data.expiresIn };
  }

  async logout() {
    try {
      await $api.post(`${this.BASE_URL}/logout`, {});
    } catch (_) {
    } finally {
      removeStorageRecloudIDAccessToken();
    }
  }
}

export const authService = new AuthService();
