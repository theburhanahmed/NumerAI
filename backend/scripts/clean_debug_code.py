"""
Script to clean up debug code from the codebase.
Removes debug logging blocks and console statements.
"""
import os
import re
from pathlib import Path

# Patterns to remove
DEBUG_PATTERNS = [
    (r'#\s*#region agent log.*?#\s*#endregion', re.DOTALL),
    (r'#\s*#region agent log.*?$', re.MULTILINE),
    (r'console\.log\([^)]*\);', re.MULTILINE),
    (r'console\.debug\([^)]*\);', re.MULTILINE),
    (r'debugger;', re.MULTILINE),
]

# Files to process
BACKEND_DIR = Path(__file__).parent.parent
FRONTEND_DIR = BACKEND_DIR.parent / 'frontend' / 'src'

def clean_file(file_path: Path):
    """Clean debug code from a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Remove debug patterns
        for pattern, flags in DEBUG_PATTERNS:
            content = re.sub(pattern, '', content, flags=flags)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Cleaned: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"Error cleaning {file_path}: {e}")
        return False

def main():
    """Main function to clean all files."""
    cleaned_count = 0
    
    # Clean backend Python files
    for py_file in BACKEND_DIR.rglob('*.py'):
        if 'migrations' not in str(py_file) and '__pycache__' not in str(py_file):
            if clean_file(py_file):
                cleaned_count += 1
    
    # Clean frontend TypeScript/JavaScript files
    for ts_file in FRONTEND_DIR.rglob('*.{ts,tsx,js,jsx}'):
        if 'node_modules' not in str(ts_file):
            if clean_file(ts_file):
                cleaned_count += 1
    
    print(f"\nCleaned {cleaned_count} files")

if __name__ == '__main__':
    main()

