import os
import re
import glob
from pathlib import Path

# Define the base directory for API modules
BASE_API_DIR = "src/app/apis"

def find_unterminated_strings(content):
    """Find lines with unterminated string literals"""
    lines = content.split('\n')
    problematic_lines = []
    
    for i, line in enumerate(lines):
        # Count quotes in the line
        single_quotes = line.count("'")
        double_quotes = line.count('"')
        triple_single = line.count("'''")
        triple_double = line.count('"""')
        
        # Adjust counts for escaped quotes
        single_quotes -= line.count("\\'") 
        double_quotes -= line.count('\\"')
        
        # Adjust for triple quotes (each triple quote counts as 3 individual quotes)
        single_quotes -= triple_single * 3
        double_quotes -= triple_double * 3
        
        # If odd number of quotes, likely unterminated
        if single_quotes % 2 != 0 or double_quotes % 2 != 0:
            problematic_lines.append((i+1, line))
    
    return problematic_lines

def fix_unterminated_strings(content):
    """Fix unterminated string literals by adding closing quotes"""
    lines = content.split('\n')
    fixed_lines = []
    in_single_quote = False
    in_double_quote = False
    in_triple_single = False
    in_triple_double = False
    
    for line in lines:
        new_line = line
        # Process line char by char to track string context
        i = 0
        while i < len(line):
            char = line[i]
            
            # Check for triple quotes
            if i+2 < len(line):
                if line[i:i+3] == '"""' and not in_single_quote and not in_triple_single:
                    in_triple_double = not in_triple_double
                    i += 2  # Skip next 2 chars
                elif line[i:i+3] == "'''" and not in_double_quote and not in_triple_double:
                    in_triple_single = not in_triple_single
                    i += 2  # Skip next 2 chars
            
            # Check for single/double quotes
            if not in_triple_single and not in_triple_double:
                if char == '"' and not in_single_quote and (i == 0 or line[i-1:i] != '\\'):
                    in_double_quote = not in_double_quote
                elif char == "'" and not in_double_quote and (i == 0 or line[i-1:i] != '\\'):
                    in_single_quote = not in_single_quote
            
            i += 1
        
        # Fix unterminated strings at end of line
        if in_single_quote:
            new_line += "'"
            in_single_quote = False
        if in_double_quote:
            new_line += '"'
            in_double_quote = False
        
        # Don't terminate triple quotes within a line
        # They often continue to next line
        
        fixed_lines.append(new_line)
    
    # Check if there are unterminated triple quotes at the end
    # This is a common pattern in docstrings
    if in_triple_single:
        fixed_lines.append("'''")
    if in_triple_double:
        fixed_lines.append('"""')
    
    return '\n'.join(fixed_lines)

def fix_api_file(file_path):
    """Fix a single API file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check for issues
        problematic_lines = find_unterminated_strings(content)
        
        if problematic_lines:
            print(f"Found {len(problematic_lines)} problematic lines in {file_path}")
            for line_num, line in problematic_lines:
                print(f"  Line {line_num}: {line[:50]}..." if len(line) > 50 else f"  Line {line_num}: {line}")
            
            # Fix issues
            fixed_content = fix_unterminated_strings(content)
            
            # Write fixed content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            
            print(f"Fixed {file_path}")
            return True
        else:
            print(f"No issues found in {file_path}")
            return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def fix_all_api_files():
    """Fix all API files in the project"""
    api_files = []
    
    # Find all __init__.py files in the apis directory and subdirectories
    for root, dirs, files in os.walk(BASE_API_DIR):
        for file in files:
            if file == "__init__.py":
                api_files.append(os.path.join(root, file))
    
    print(f"Found {len(api_files)} API files to check")
    
    fixed_files = 0
    for file_path in api_files:
        if fix_api_file(file_path):
            fixed_files += 1
    
    print(f"Fixed {fixed_files} files")

# Run the script
if __name__ == "__main__":
    fix_all_api_files()
