import os
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from app.core.security import generate_random_storage_path, validate_file_security

class ProcessingError(Exception):
    def __init__(self, message: str, error_code: str = "PROCESSING_FAILED"):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)

class DocumentProcessor(ABC):
    """Base abstract processor for all document operations."""
    
    def __init__(self, tool_type: str):
        self.tool_type = tool_type

    def prepare_output_file(self, extension: str) -> str:
        _, output_path = generate_random_storage_path(extension)
        return output_path

    @abstractmethod
    def process(self, input_paths: List[str], options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes document conversion/processing.
        Returns dict with output_path and metadata.
        """
        pass

    def cleanup_files(self, paths: List[str]):
        """Safely removes temporary files if requested."""
        for path in paths:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except Exception:
                    pass
