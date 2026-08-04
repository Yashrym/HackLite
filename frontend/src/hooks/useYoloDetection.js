import { useCallback, useState } from 'react';
import { detectImage as detectImageApi } from '../services/api';

export function useYoloDetection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const runDetection = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    try {
      const data = await detectImageApi(file);
      setResult(data);
      return data;
    } catch (e) {
      const msg = e.response?.data?.detail || e.message || 'Detection failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      throw e;
    } finally {
      setLoading(false);
    }
  }, [previewUrl]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [previewUrl]);

  return { loading, error, result, previewUrl, runDetection, reset };
}
