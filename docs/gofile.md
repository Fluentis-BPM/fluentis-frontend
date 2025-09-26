# GoFile Integration

This project integrates basic file uploads to [GoFile](https://gofile.io) for the dynamic campo type `archivo`.

## Features Implemented
- Guest or token-authenticated upload using `https://upload.gofile.io/uploadfile` (free-tier compatible).
- Progress bar & status feedback.
- Stores response metadata (provider, fileId, fileName, directLink, folderId) as JSON in the field value.
- Reuses first-created folder (guest parentFolder) across later uploads via `localStorage` key `gofileFolderId`.
- Graceful error handling & retry (clear and reselect file).

## Not Implemented (Future Ideas)
- Managing folders (create, rename, set access) – premium endpoints.
- Deleting or updating file metadata through GoFile API.
- Direct link expiration / access control.
- Multi-file batch selection.

## Configuration
Add an environment variable (optional for authenticated requests):

```
VITE_GOFILE_TOKEN=YOUR_API_TOKEN
```

If omitted, uploads proceed in guest mode.

## Security Notes
- Do NOT hardcode the token in source control. Use a `.env.local` (gitignored) file for local development.
- Values stored in the form field include a direct link; treat it as public unless you manage folder privacy via premium features.

## Stored Field Value Format
The campo `archivo` saves a JSON string similar to:
```json
{
  "provider": "gofile",
  "fileId": "123abc456",
  "fileName": "document.pdf",
  "directLink": "https://storeXX.gofile.io/download/direct/123abc456/document.pdf",
  "folderId": "GUESTFOLDER123"
}
```
Consumer logic (backend or downstream) should parse/validate this JSON before using.

## Folder Reuse Logic
On first successful upload when a `parentFolder` (folderId) is returned it is cached in `localStorage` under `gofileFolderId`. Subsequent uploads attempt to place new files into the same folder (faster & grouped). Delete that key to reset grouping.

## Error Handling
- Network or API errors show a red message with retry by selecting a new file again.
- Aborted uploads surface a generic error message.

## Extending
To add deletion/support for more endpoints, create methods in `src/services/gofile.ts` using the Authorization header pattern already established.

