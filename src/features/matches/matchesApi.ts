import { API_ENDPOINTS } from '../../config/api';
import type {
  MatchFilters,
  MatchResultDto,
  MatchesApiResponse
} from './matchesTypes';

export async function fetchMatches(
  filters: MatchFilters
): Promise<MatchResultDto[]> {
  const url = new URL(API_ENDPOINTS.matches);

  if (filters.medicineName?.trim()) {
    url.searchParams.set('medicineName', filters.medicineName.trim());
  }

  if (filters.area?.trim()) {
    url.searchParams.set('area', filters.area.trim());
  }

  if (filters.criticalOnly) {
    url.searchParams.set('criticalOnly', 'true');
  }

  url.searchParams.set('limit', String(filters.limit ?? 50));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar cruzamentos. HTTP ${response.status}.`);
  }

  const data = (await response.json()) as MatchesApiResponse;

  if (Array.isArray(data)) {
    return data;
  }

  return data.items ?? [];
}