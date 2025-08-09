export interface Feature {
  id: string;
  name: string;
  description: string;
  viewed: boolean;
  releaseDate: string;
}

const FEATURES_BASE_URL = (typeof window !== 'undefined' ? (window as any).__FEATURES_BASE_URL : undefined) ||
  process.env.FEATURES_BASE_URL ||
  '/api/features';

export const getFeatureFlags = async (): Promise<Feature[]> => {
  const res = await fetch(`${FEATURES_BASE_URL}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch features: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { features: Feature[] } | Feature[];
  return Array.isArray(data) ? data : data.features;
};

export const markFeatureViewed = async (featureId: string): Promise<void> => {
  const res = await fetch(`${FEATURES_BASE_URL}/viewed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ featureId }),
  });

  if (!res.ok) {
    throw new Error(`Failed to mark feature viewed: ${res.status} ${res.statusText}`);
  }
};
