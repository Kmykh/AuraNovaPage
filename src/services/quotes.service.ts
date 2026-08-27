import { apiClient } from '../lib/api-client';
import { PagedResponse } from '../types/common';
import { QuoteResponse, UpdateQuoteRequest } from '../types/quotes';

export const QuotesService = {
  getQuotes: async (params?: Record<string, string | number>): Promise<QuoteResponse[]> => {
    const { data } = await apiClient.get<QuoteResponse[]>('/api/admin/quotes', { params });
    return data;
  },

  getQuote: async (id: string): Promise<QuoteResponse> => {
    const { data } = await apiClient.get<QuoteResponse>(`/api/admin/quotes/${id}`);
    return data;
  },

  updateQuote: async (id: string, request: UpdateQuoteRequest): Promise<QuoteResponse> => {
    const { data } = await apiClient.patch<QuoteResponse>(`/api/admin/quotes/${id}`, request);
    return data;
  }
};
