import fs from 'fs';
import path from 'path';
import { cleanDir, ensureDir, writeFile, generateYamlFrontmatter, replacePlaceholders } from '../utils.js';

/**
 * OpenCode Transformer (Full Featured - File-based)
 *
 * Commands: Uses description-only frontmatter with $ARGUMENTS placeholder
 * Skills: Uses Agent Skills standard with SKILL.md in .opencode/skills/{name}/
 * Reference files are copied to skill subdirectories
 * Includes install.sh script for easy installation
 *
 * @param {Array} commands - Parsed command objects
 * @param {Array} skills - Parsed skill objects
 * @param {string} distDir - Distribution output directory
 * @param {Object|null} patterns - Unused; retained for API consistency with other transformers
 * @param {Object} options - Optional settings
 * @param {string} options.prefix - Prefix to add to command names (e.g., 'i-')
 * @param {string} options.outputSuffix - Suffix for output directory (e.g., '-prefixed')
 */
export function transformOpenCode(commands, skills, distDir, patterns = null, options = {}) {
  const { prefix = '', outputSuffix = '' } = options;
  const opencodeDir = path.join(distDir, `opencode${outputSuffix}`);
  const commandsDir = path.join(opencodeDir, '.opencode/commands');
  const skillsDir = path.join(opencodeDir, '.opencode/skills');

  cleanDir(opencodeDir);
  ensureDir(commandsDir);
  ensureDir(skillsDir);

  // Commands: OpenCode format (description only, $ARGUMENTS placeholder)
  for (const command of commands) {
    const commandName = `${prefix}${command.name}`;

    // OpenCode uses simpler frontmatter - just description
    const yamlLines = ['---'];
    yamlLines.push(`description: ${command.description}`);
    yamlLines.push('---');

    // First replace our provider placeholders, then transform {{argname}} to $ARGUMENTS
    let body = replacePlaceholders(command.body, 'opencode');
    // Replace all {{argname}} patterns with $ARGUMENTS (OpenCode uses single args string)
    body = body.replace(/\{\{([^}]+)\}\}/g, '$ARGUMENTS');

    const content = `${yamlLines.join('\n')}\n\n${body}`;
    const outputPath = path.join(commandsDir, `${commandName}.md`);
    writeFile(outputPath, content);
  }

  // Skills: Keep full frontmatter + body in subdirectories (same as Claude Code)
  let refCount = 0;
  for (const skill of skills) {
    const skillDir = path.join(skillsDir, skill.name);

    const frontmatterObj = {
      name: skill.name,
      description: skill.description,
    };

    // Add optional fields if present
    if (skill.license) frontmatterObj.license = skill.license;
    if (skill.compatibility) frontmatterObj.compatibility = skill.compatibility;
    if (skill.metadata) frontmatterObj.metadata = skill.metadata;
    if (skill.allowedTools) frontmatterObj['allowed-tools'] = skill.allowedTools;

    const frontmatter = generateYamlFrontmatter(frontmatterObj);

    const skillBody = replacePlaceholders(skill.body, 'opencode');
    const content = `${frontmatter}\n\n${skillBody}`;
    const outputPath = path.join(skillDir, 'SKILL.md');
    writeFile(outputPath, content);

    // Copy reference files if they exist
    if (skill.references && skill.references.length > 0) {
      const refDir = path.join(skillDir, 'reference');
      ensureDir(refDir);
      for (const ref of skill.references) {
        const refOutputPath = path.join(refDir, `${ref.name}.md`);
        const refContent = replacePlaceholders(ref.content, 'opencode');
        writeFile(refOutputPath, refContent);
        refCount++;
      }
    }
  }

  // Generate install.sh script
  const installScript = generateInstallScript(prefix);
  const installPath = path.join(opencodeDir, 'install.sh');
  writeFile(installPath, installScript);
  fs.chmodSync(installPath, 0o755);

  const refInfo = refCount > 0 ? ` (${refCount} reference files)` : '';
  const prefixInfo = prefix ? ` [${prefix}prefixed]` : '';
  console.log(`✓ OpenCode${prefixInfo}: ${commands.length} commands, ${skills.length} skills${refInfo}`);
}

/**
 * Generate the install.sh script for easy installation
 */
function generateInstallScript(prefix = '') {
  const prefixNote = prefix ? `\n# Note: Commands are prefixed with '${prefix}' (e.g., /${prefix}normalize)` : '';

  return `#!/bin/bash
# Install Impeccable commands and skills for OpenCode
# https://github.com/open-horizon-labs/impeccable
${prefixNote}

set -e

SCRIPT_DIR="$(cd "$(dirname "\$0")" && pwd)"
TARGET="\${1:-.}"  # Default to current directory

# Resolve to absolute path
TARGET="$(cd "\$TARGET" 2>/dev/null && pwd)" || {
  echo "Error: Target directory '\$1' does not exist"
  exit 1
}

echo "Installing Impeccable to \$TARGET/.opencode/..."

# Create directories
mkdir -p "\$TARGET/.opencode/commands"
mkdir -p "\$TARGET/.opencode/skills"

# Copy commands
if [ -d "\$SCRIPT_DIR/.opencode/commands" ]; then
  cp -r "\$SCRIPT_DIR/.opencode/commands/"* "\$TARGET/.opencode/commands/" 2>/dev/null || true
fi

# Copy skills (preserving directory structure)
if [ -d "\$SCRIPT_DIR/.opencode/skills" ]; then
  cp -r "\$SCRIPT_DIR/.opencode/skills/"* "\$TARGET/.opencode/skills/" 2>/dev/null || true
fi

# Count installed items
CMD_COUNT=$(find "\$TARGET/.opencode/commands" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
SKILL_COUNT=$(find "\$TARGET/.opencode/skills" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "✓ Installed successfully!"
echo "  Commands: \$CMD_COUNT"
echo "  Skills:   \$SKILL_COUNT"
echo ""
echo "Usage: In OpenCode, type /${prefix}normalize, /${prefix}polish, etc."
`;
}
