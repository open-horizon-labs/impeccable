#!/bin/bash
# Install Impeccable commands and skills for OpenCode
# https://github.com/open-horizon-labs/impeccable

# Note: Commands are prefixed with 'i-' (e.g., /i-normalize)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-.}"  # Default to current directory

# Resolve to absolute path
TARGET="$(cd "$TARGET" 2>/dev/null && pwd)" || {
  echo "Error: Target directory '$1' does not exist"
  exit 1
}

echo "Installing Impeccable to $TARGET/.opencode/..."

# Create directories
mkdir -p "$TARGET/.opencode/commands"
mkdir -p "$TARGET/.opencode/skills"

# Copy commands
if [ -d "$SCRIPT_DIR/.opencode/commands" ]; then
  cp -r "$SCRIPT_DIR/.opencode/commands/"* "$TARGET/.opencode/commands/" 2>/dev/null || true
fi

# Copy skills (preserving directory structure)
if [ -d "$SCRIPT_DIR/.opencode/skills" ]; then
  cp -r "$SCRIPT_DIR/.opencode/skills/"* "$TARGET/.opencode/skills/" 2>/dev/null || true
fi

# Count installed items
CMD_COUNT=$(find "$TARGET/.opencode/commands" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
SKILL_COUNT=$(find "$TARGET/.opencode/skills" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "✓ Installed successfully!"
echo "  Commands: $CMD_COUNT"
echo "  Skills:   $SKILL_COUNT"
echo ""
echo "Usage: In OpenCode, type /i-normalize, /i-polish, etc."
