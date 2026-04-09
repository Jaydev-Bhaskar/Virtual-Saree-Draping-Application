const BASE_URL = 'http://localhost:8000';
const API_BASE_URL = `${BASE_URL}/api/v1`;

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
export const getAssetUrl = (path) => {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('/images/')) return path;
    return `${BASE_URL}${path}`;
};

export default API_BASE_URL;
