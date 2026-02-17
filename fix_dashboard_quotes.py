import re

# Read the file
with open('frontend/src/components/Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix all axios calls - replace single quotes with backticks for template literals
patterns = [
    (r"axios\.(get|post|put|delete)\(`\$\{API_URL\}([^`]+), \{", r"axios.\1(`${API_URL}\2`, {"),
    (r"axios\.(get|post|put|delete)\(`\$\{API_URL\}([^`]+), ([a-zA-Z]+)", r"axios.\1(`${API_URL}\2`, \3"),
]

for pattern, replacement in patterns:
    content = re.sub(pattern, replacement, content)

# Write back
with open('frontend/src/components/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed all axios calls in Dashboard.jsx")
