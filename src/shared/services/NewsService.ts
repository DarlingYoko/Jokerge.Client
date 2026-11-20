import { $api } from '@/services/api.service';
import {
  TDeletePanelNewsResponse,
  TGetPanelNewsResponse,
  TPanelNewsResponse,
  TPanelNewsWriteRequest,
} from '@/shared/api/contracts/news/schemas';

class NewsService {
  private BASE_URL = '/news';

  async getAll(): Promise<TGetPanelNewsResponse> {
    const { data } = await $api.get<TGetPanelNewsResponse>(this.BASE_URL);
    return data;
  }

  async create(body: TPanelNewsWriteRequest): Promise<TPanelNewsResponse> {
    const { data } = await $api.post<TPanelNewsResponse>(this.BASE_URL, body);
    return data;
  }

  async update(id: number, body: TPanelNewsWriteRequest): Promise<TPanelNewsResponse> {
    const { data } = await $api.put<TPanelNewsResponse>(`${this.BASE_URL}/${id}`, body);
    return data;
  }

  async remove(id: number): Promise<TDeletePanelNewsResponse> {
    const { data } = await $api.delete<TDeletePanelNewsResponse>(`${this.BASE_URL}/${id}`);
    return data;
  }
}

export const newsService = new NewsService();
