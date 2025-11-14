#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Normalize all file links in data.json to relative paths.

This script converts:
1. Absolute UNC paths (file:///\\\\cev-file5\\data\\...) to relative paths
2. Backslashes to forward slashes
3. URL-encoded characters to normal characters
"""

import json
import re
import urllib.parse
import shutil
from pathlib import Path

def normalize_link(link):
    """
    Normalize a file link to a relative path format.
    
    Args:
        link (str): Original link in various formats
        
    Returns:
        str: Normalized relative path with forward slashes
    """
    if not link or not isinstance(link, str):
        return link
    
    # Remove file:// protocol
    normalized = link.replace('file:///', '')
    
    # Remove UNC path prefix (network drive paths)
    # Pattern: \\\\cev-file5\\data\\☆☆管理部★★\\00全体共有情報フォルダー\\NEVの窓　掲載ファイル\\
    # or similar variations
    unc_patterns = [
        r'^\\\\[^\\]+\\[^\\]+\\[^\\]+\\[^\\]+\\',  # \\\\server\\share\\folder1\\folder2\\
        r'^\\\\[^\\]+\\[^\\]+\\[^\\]+\\',            # \\\\server\\share\\folder1\\
        r'^\\\\[^\\]+\\[^\\]+\\',                    # \\\\server\\share\\
    ]
    
    for pattern in unc_patterns:
        normalized = re.sub(pattern, '', normalized)
    
    # Convert backslashes to forward slashes
    normalized = normalized.replace('\\', '/')
    
    # URL decode (e.g., %20 -> space, %E3%81%AE -> の)
    try:
        normalized = urllib.parse.unquote(normalized)
    except Exception:
        pass  # Keep original if decoding fails
    
    # Remove leading/trailing slashes
    normalized = normalized.strip('/')
    
    # If the path is empty or too short, return original
    if not normalized or len(normalized) < 3:
        return link
    
    return normalized


def normalize_item_links(item):
    """
    Normalize links in a single item.
    
    Args:
        item: Item object (dict or string)
        
    Returns:
        Modified item with normalized links
    """
    if isinstance(item, dict) and 'link' in item:
        item['link'] = normalize_link(item['link'])
    return item


def normalize_section_links(section):
    """
    Normalize all links in a section.
    
    Args:
        section (dict): Section object containing items
    """
    # Process items in main section
    if 'items' in section and isinstance(section['items'], list):
        for item in section['items']:
            normalize_item_links(item)
    
    # Process subsections if they exist
    if 'subsections' in section and isinstance(section['subsections'], list):
        for subsection in section['subsections']:
            if 'items' in subsection and isinstance(subsection['items'], list):
                for item in subsection['items']:
                    normalize_item_links(item)


def normalize_all_links(data):
    """
    Normalize all links in the entire data structure.
    
    Args:
        data (dict): The complete board data structure
    """
    # Process both tabs
    for tab_name in ['全員向け', '職員向け']:
        if tab_name in data and 'sections' in data[tab_name]:
            sections = data[tab_name]['sections']
            if isinstance(sections, list):
                for section in sections:
                    normalize_section_links(section)


def main():
    """Main function to normalize links in data.json"""
    data_file = Path('data.json')
    
    if not data_file.exists():
        print(f"Error: {data_file} not found!")
        return 1
    
    # Create backup
    backup_file = Path('data.json.backup')
    shutil.copy(data_file, backup_file)
    print(f"✓ Backup created: {backup_file}")
    
    # Load data
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Normalize all links
    normalize_all_links(data)
    
    # Save normalized data
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ All links normalized in {data_file}")
    print("\nConversion examples:")
    print("  Before: file:///\\\\cev-file5\\data\\...\\INFORMATION\\file.pdf")
    print("  After:  INFORMATION/file.pdf")
    print("\n  Before: INFORMATION\\\\file.pdf")
    print("  After:  INFORMATION/file.pdf")
    print("\n  Before: 共通コーナー\\\\NEV%20組織.pdf")
    print("  After:  共通コーナー/NEV 組織.pdf")
    
    return 0


if __name__ == '__main__':
    exit(main())
