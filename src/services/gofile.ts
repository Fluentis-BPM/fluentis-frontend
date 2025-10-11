// GoFile service (basic free-tier compatible upload)
// NOTE: Do NOT hardcode secret tokens in the repo. Expect GOFILE_TOKEN via runtime configuration.
// For now we'll allow passing explicit token param for your standard (non-premium) account.

export interface GoFileUploadResult {
  ok: boolean;
  fileId?: string;
  fileName?: string;
  directLink?: string;
  folderId?: string; // destination folder for reuse
  raw?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  error?: string;
}

interface InternalUploadResponse {
  status: string;
  data?: {
    fileId?: string;
    fileName?: string;
    downloadPage?: string;
    directLink?: string;
    parentFolder?: string; // in guest mode, a folder code
  };
  message?: string;
}

const GOFILE_UPLOAD_ENDPOINT = 'https://upload.gofile.io/uploadfile';

export async function uploadToGoFile(params: { file: File; token?: string; folderId?: string; signal?: AbortSignal; onProgress?: (pct: number) => void; }): Promise<GoFileUploadResult> {
  const { file, token, folderId, signal, onProgress } = params;
  try {
    const formData = new FormData();
    formData.append('file', file, file.name);
    if (folderId) formData.append('folderId', folderId);

    // Use raw XMLHttpRequest for progress (fetch progress for multipart not widely supported cross-browser)
    const xhr = new XMLHttpRequest();

    const result: GoFileUploadResult = { ok: false };

    const uploadPromise = new Promise<GoFileUploadResult>((resolve, reject) => {
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json: InternalUploadResponse = JSON.parse(xhr.responseText);
              if (json.status === 'ok') {
                result.ok = true;
                result.fileId = json.data?.fileId;
                result.fileName = json.data?.fileName;
                result.directLink = json.data?.directLink || json.data?.downloadPage;
                result.folderId = json.data?.parentFolder;
                result.raw = json;
                resolve(result);
              } else {
                resolve({ ok: false, error: json.message || 'Upload failed', raw: json });
              }
            } catch (e) {
              resolve({ ok: false, error: 'Invalid response from GoFile' });
            }
          } else {
            resolve({ ok: false, error: 'HTTP ' + xhr.status });
          }
        }
      };
      xhr.onerror = () => resolve({ ok: false, error: 'Network error' });
      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            onProgress(pct);
          }
        };
      }
      xhr.open('POST', GOFILE_UPLOAD_ENDPOINT, true);
      if (token) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      }
      xhr.send(formData);

      if (signal) {
        signal.addEventListener('abort', () => {
          xhr.abort();
          reject(new Error('Upload aborted'));
        });
      }
    });

    return await uploadPromise;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export function getStoredGoFileFolderId(): string | null {
  try { return localStorage.getItem('gofileFolderId'); } catch { return null; }
}

export function storeGoFileFolderId(folderId: string) {
  try { localStorage.setItem('gofileFolderId', folderId); } catch { /* ignore */ }
}
