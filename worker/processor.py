"""
Text Processor Module
Contains all supported text operations and a dispatcher function.

Supported operations:
  - uppercase  : Converts text to UPPER CASE
  - lowercase  : Converts text to lower case
  - reverse    : Reverses the entire string
  - word_count : Counts the number of words
"""


def process_uppercase(text):
    """Convert the input text to uppercase."""
    return text.upper()


def process_lowercase(text):
    """Convert the input text to lowercase."""
    return text.lower()


def process_reverse(text):
    """Reverse the input text character by character."""
    return text[::-1]


def process_word_count(text):
    """Count the number of words in the input text."""
    return str(len(text.split()))


# Map operation names to their handler functions
OPERATION_MAP = {
    "uppercase": process_uppercase,
    "lowercase": process_lowercase,
    "reverse": process_reverse,
    "word_count": process_word_count,
}


def process_task(input_text, operation):
    """
    Dispatch the input text to the correct operation handler.

    Args:
        input_text: The raw text to process.
        operation:  The operation name (must be a key in OPERATION_MAP).

    Returns:
        tuple: (result_string, log_message_describing_operation)

    Raises:
        ValueError: If the operation is not supported.
    """
    handler = OPERATION_MAP.get(operation)

    if handler is None:
        raise ValueError(
            f"Unsupported operation '{operation}'. "
            f"Allowed: {', '.join(OPERATION_MAP.keys())}"
        )

    result = handler(input_text)
    log_message = f"Performing {operation} operation"

    return result, log_message
