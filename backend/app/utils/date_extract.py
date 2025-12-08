import re
from datetime import datetime, timedelta
from dateutil import parser as date_parser


def extract_dates(text: str) -> list[datetime]:
    """
    Extract dates and deadlines from text
    
    Args:
        text: Input text to analyze
    
    Returns:
        List of extracted datetime objects
    """
    dates = []
    
    # Pattern 1: Explicit dates (YYYY-MM-DD, MM/DD/YYYY, etc.)
    date_patterns = [
        r'\d{4}-\d{2}-\d{2}',  # 2025-12-10
        r'\d{2}/\d{2}/\d{4}',  # 12/10/2025
        r'\d{2}-\d{2}-\d{4}',  # 12-10-2025
    ]
    
    for pattern in date_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            try:
                parsed_date = date_parser.parse(match)
                dates.append(parsed_date)
            except:
                pass
    
    # Pattern 2: Relative dates
    text_lower = text.lower()
    
    if "tomorrow" in text_lower:
        dates.append(datetime.now() + timedelta(days=1))
    
    if "next week" in text_lower:
        dates.append(datetime.now() + timedelta(weeks=1))
    
    # Pattern 3: "due on [date]" or "deadline [date]"
    due_pattern = r'(?:due|deadline|by)\s+(?:on\s+)?([A-Za-z]+\s+\d{1,2}(?:,?\s+\d{4})?)'
    due_matches = re.findall(due_pattern, text_lower)
    for match in due_matches:
        try:
            parsed_date = date_parser.parse(match, fuzzy=True)
            dates.append(parsed_date)
        except:
            pass
    
    return dates


def extract_first_date(text: str) -> datetime | None:
    """
    Extract the first/earliest date from text
    
    Args:
        text: Input text
    
    Returns:
        First datetime found or None
    """
    dates = extract_dates(text)
    return min(dates) if dates else None
