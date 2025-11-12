# Cloudinary File Organization System

## Overview
Files uploaded to Cloudinary are now organized by request ID to make it easier to manage and find files for each translation request.

## Folder Structure

### Cloudinary Folders
```
translated-ae/
├── requests/
│   ├── {request-id-1}/
│   │   ├── 1703123456789-document1.pdf
│   │   └── 1703123456790-document2.docx
│   ├── {request-id-2}/
│   │   └── 1703123456800-contract.pdf
│   └── {request-id-3}/
│       ├── 1703123456810-manual.pdf
│       └── 1703123456820-guide.docx
└── documents/ (fallback for old uploads)
    └── legacy-files...
```

### Local Storage Folders (Fallback)
```
public/uploads/
├── {request-id-1}/
│   ├── 1703123456789-document1.pdf
│   └── 1703123456790-document2.docx
├── {request-id-2}/
│   └── 1703123456800-contract.pdf
└── {request-id-3}/
    ├── 1703123456810-manual.pdf
    └── 1703123456820-guide.docx
```

## How It Works

### 1. Request Creation
- When a new translation request is submitted, a unique request ID is generated
- The request is created in the database first to get the ID

### 2. File Upload
- Files are uploaded to Cloudinary using the request ID as folder name
- Folder path: `translated-ae/requests/{request-id}`
- Public ID format: `{timestamp}-{filename-without-extension}`

### 3. File Organization
- Each request gets its own folder
- Files are easily identifiable by request ID
- Admin can quickly find all files for a specific request

## Benefits

### ✅ **Better Organization**
- Files are grouped by request ID
- Easy to find all files for a specific translation request
- Clear folder structure in Cloudinary dashboard

### ✅ **Improved Management**
- Admins can quickly locate files
- Better file tracking and organization
- Easier to manage multiple requests

### ✅ **Scalability**
- System works with any number of requests
- Each request is isolated in its own folder
- No file name conflicts between requests

## API Endpoints

### New Endpoint: `/api/requests-with-files`
- Handles complete request submission with file upload
- Creates request ID first, then uploads files to organized folders
- Sends email notifications after successful submission

### Updated Endpoint: `/api/upload`
- Still available for individual file uploads
- Now supports optional `requestId` parameter for organization

## File Naming Convention

### Cloudinary Public ID
```
{timestamp}-{original-filename-without-extension}
```

### Examples
- `1703123456789-contract.pdf` → Public ID: `1703123456789-contract`
- `1703123456790-user-manual.docx` → Public ID: `1703123456790-user-manual`

## Migration Notes

### Existing Files
- Old files remain in `translated-ae/documents/` folder
- New uploads use the organized folder structure
- No data loss during transition

### Backward Compatibility
- System still works with old file URLs
- View and download functions handle both old and new formats
- Gradual migration to new system

## Monitoring

### Console Logging
The system includes detailed logging for file uploads:
```
📁 Uploading to Cloudinary folder: translated-ae/requests/req_123
📄 File: document.pdf (1024 bytes)
🆔 Request ID: req_123
🔑 Public ID: 1703123456789-document
✅ Cloudinary upload successful:
   📁 Folder: translated-ae/requests/req_123
   🔗 URL: https://res.cloudinary.com/...
   🆔 Public ID: 1703123456789-document
```

## Troubleshooting

### Common Issues
1. **File not found**: Check if request ID exists in database
2. **Upload failed**: Verify Cloudinary credentials
3. **Folder not created**: Check Cloudinary permissions

### Debug Steps
1. Check console logs for upload details
2. Verify request ID in database
3. Check Cloudinary dashboard for folder structure
4. Test with small file first

## Future Enhancements

### Planned Features
- Bulk file operations by request ID
- File versioning within request folders
- Automatic cleanup of old files
- File preview in admin dashboard
- Request-specific file management tools

