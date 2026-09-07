# How to Add a New Document Tool

Adding a new converter or document processing utility to Pick Your Document requires zero duplicated code.

## Step 1: Create Backend Processor Service

Create a new file under `backend/app/services/converters/` or `backend/app/services/pdf/` inheriting from `DocumentProcessor`:

```python
from app.services.processor import DocumentProcessor, ProcessingError

class ExcelToPdfProcessor(DocumentProcessor):
    def __init__(self):
        super().__init__("excel-to-pdf")

    def process(self, input_paths: List[str], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        output_path = self.prepare_output_file("pdf")
        # Perform conversion logic...
        return {
            "output_path": output_path,
            "output_filename": "converted.pdf",
            "file_size": os.path.getsize(output_path)
        }
```

## Step 2: Register API Route Endpoint

In `backend/app/api/v1/endpoints/converters.py`:

```python
@router.post("/excel-to-pdf", response_model=StandardResponse)
async def convert_excel_to_pdf(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    # Call processor and record_job_and_usage(...)
```

## Step 3: Add Tool Entry in Centralized Tool Registry

In `frontend/src/config/tools.config.ts`, add:

```typescript
'excel-to-pdf': {
  id: 'excel-to-pdf',
  name: 'Excel to PDF Converter',
  tagline: 'Convert spreadsheet files to PDF format.',
  description: '...',
  category: 'documents',
  iconName: 'FileSpreadsheet',
  inputFormats: ['XLSX', 'XLS'],
  outputFormat: 'PDF',
  accept: '.xlsx,.xls',
  apiEndpoint: '/api/v1/convert/excel-to-pdf',
  seoTitle: 'Excel to PDF Converter — Pick Your Document',
  seoDescription: '...',
  howToSteps: [...],
  limitations: [...],
  faqs: [...]
}
```

The frontend tools directory, search filter, and dynamic tool runner will instantly render and support the new tool!
