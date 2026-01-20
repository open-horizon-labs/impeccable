import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { transformOpenCode } from '../../../scripts/lib/transformers/opencode.js';
import { parseFrontmatter } from '../../../scripts/lib/utils.js';

const TEST_DIR = path.join(process.cwd(), 'test-tmp-opencode');

describe('transformOpenCode', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  test('should create correct directory structure', () => {
    const commands = [];
    const skills = [];

    transformOpenCode(commands, skills, TEST_DIR);

    expect(fs.existsSync(path.join(TEST_DIR, 'opencode/.opencode/commands'))).toBe(true);
    expect(fs.existsSync(path.join(TEST_DIR, 'opencode/.opencode/skills'))).toBe(true);
  });

  test('should create command with description-only frontmatter', () => {
    const commands = [
      {
        name: 'test-command',
        description: 'A test command',
        args: [
          { name: 'target', description: 'The target', required: false }
        ],
        body: 'Command body here.'
      }
    ];

    transformOpenCode(commands, [], TEST_DIR);

    const outputPath = path.join(TEST_DIR, 'opencode/.opencode/commands/test-command.md');
    const content = fs.readFileSync(outputPath, 'utf-8');
    const parsed = parseFrontmatter(content);

    // OpenCode only uses description in frontmatter (no name, no args)
    expect(parsed.frontmatter.description).toBe('A test command');
    expect(parsed.frontmatter.name).toBeUndefined();
    expect(parsed.frontmatter.args).toBeUndefined();
    expect(parsed.body).toBe('Command body here.');
  });

  test('should transform {{argname}} to $ARGUMENTS', () => {
    const commands = [
      {
        name: 'normalize',
        description: 'Normalize',
        args: [{ name: 'target', description: 'Target', required: false }],
        body: 'Please normalize {{target}} to match the design system.'
      }
    ];

    transformOpenCode(commands, [], TEST_DIR);

    const content = fs.readFileSync(path.join(TEST_DIR, 'opencode/.opencode/commands/normalize.md'), 'utf-8');
    const parsed = parseFrontmatter(content);

    expect(parsed.body).toContain('$ARGUMENTS');
    expect(parsed.body).not.toContain('{{target}}');
  });

  test('should transform multiple different placeholders to $ARGUMENTS', () => {
    const commands = [
      {
        name: 'multi-arg',
        description: 'Multiple args',
        args: [],
        body: 'Process {{input}} and output to {{output}} with {{format}}.'
      }
    ];

    transformOpenCode(commands, [], TEST_DIR);

    const content = fs.readFileSync(path.join(TEST_DIR, 'opencode/.opencode/commands/multi-arg.md'), 'utf-8');
    const parsed = parseFrontmatter(content);

    // All placeholders become $ARGUMENTS
    expect(parsed.body).toBe('Process $ARGUMENTS and output to $ARGUMENTS with $ARGUMENTS.');
    expect(parsed.body).not.toContain('{{');
  });

  test('should create skills in subdirectories with SKILL.md filename', () => {
    const skills = [
      {
        name: 'test-skill',
        description: 'A test skill',
        license: 'MIT',
        body: 'Skill instructions.'
      }
    ];

    transformOpenCode([], skills, TEST_DIR);

    const outputPath = path.join(TEST_DIR, 'opencode/.opencode/skills/test-skill/SKILL.md');
    expect(fs.existsSync(outputPath)).toBe(true);

    const content = fs.readFileSync(outputPath, 'utf-8');
    const parsed = parseFrontmatter(content);

    expect(parsed.frontmatter.name).toBe('test-skill');
    expect(parsed.frontmatter.description).toBe('A test skill');
    expect(parsed.frontmatter.license).toBe('MIT');
    expect(parsed.body).toBe('Skill instructions.');
  });

  test('should handle skills without license', () => {
    const skills = [
      {
        name: 'no-license-skill',
        description: 'Skill without license',
        license: '',
        body: 'Body content.'
      }
    ];

    transformOpenCode([], skills, TEST_DIR);

    const content = fs.readFileSync(path.join(TEST_DIR, 'opencode/.opencode/skills/no-license-skill/SKILL.md'), 'utf-8');
    const parsed = parseFrontmatter(content);

    expect(parsed.frontmatter.license).toBeUndefined();
  });

  test('should copy reference files to skill subdirectories', () => {
    const skills = [
      {
        name: 'skill-with-refs',
        description: 'Skill with references',
        license: 'MIT',
        body: 'Main skill content.',
        references: [
          { name: 'typography', content: 'Typography guidelines here.' },
          { name: 'colors', content: 'Color palette here.' }
        ]
      }
    ];

    transformOpenCode([], skills, TEST_DIR);

    // Check reference directory exists
    const refDir = path.join(TEST_DIR, 'opencode/.opencode/skills/skill-with-refs/reference');
    expect(fs.existsSync(refDir)).toBe(true);

    // Check reference files
    expect(fs.existsSync(path.join(refDir, 'typography.md'))).toBe(true);
    expect(fs.existsSync(path.join(refDir, 'colors.md'))).toBe(true);

    const typographyContent = fs.readFileSync(path.join(refDir, 'typography.md'), 'utf-8');
    expect(typographyContent).toBe('Typography guidelines here.');
  });

  test('should create install.sh script', () => {
    transformOpenCode([], [], TEST_DIR);

    const installPath = path.join(TEST_DIR, 'opencode/install.sh');
    expect(fs.existsSync(installPath)).toBe(true);

    const content = fs.readFileSync(installPath, 'utf-8');
    expect(content).toContain('#!/bin/bash');
    expect(content).toContain('Install Impeccable');
    expect(content).toContain('.opencode/commands');
    expect(content).toContain('.opencode/skills');
  });

  test('should handle multiple commands', () => {
    const commands = [
      { name: 'cmd1', description: 'Command 1', args: [], body: 'Body 1' },
      { name: 'cmd2', description: 'Command 2', args: [], body: 'Body 2' },
      { name: 'cmd3', description: 'Command 3', args: [], body: 'Body 3' }
    ];

    transformOpenCode(commands, [], TEST_DIR);

    expect(fs.existsSync(path.join(TEST_DIR, 'opencode/.opencode/commands/cmd1.md'))).toBe(true);
    expect(fs.existsSync(path.join(TEST_DIR, 'opencode/.opencode/commands/cmd2.md'))).toBe(true);
    expect(fs.existsSync(path.join(TEST_DIR, 'opencode/.opencode/commands/cmd3.md'))).toBe(true);
  });

  test('should handle multiple skills', () => {
    const skills = [
      { name: 'skill1', description: 'Skill 1', license: 'MIT', body: 'Body 1' },
      { name: 'skill2', description: 'Skill 2', license: 'Apache', body: 'Body 2' }
    ];

    transformOpenCode([], skills, TEST_DIR);

    expect(fs.existsSync(path.join(TEST_DIR, 'opencode/.opencode/skills/skill1/SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(TEST_DIR, 'opencode/.opencode/skills/skill2/SKILL.md'))).toBe(true);
  });

  test('should clean existing directory before writing', () => {
    fs.mkdirSync(path.join(TEST_DIR, 'opencode/.opencode/commands'), { recursive: true });
    fs.writeFileSync(path.join(TEST_DIR, 'opencode/.opencode/commands/old.md'), 'old');

    const commands = [{ name: 'new', description: 'New', args: [], body: 'New' }];
    transformOpenCode(commands, [], TEST_DIR);

    expect(fs.existsSync(path.join(TEST_DIR, 'opencode/.opencode/commands/old.md'))).toBe(false);
    expect(fs.existsSync(path.join(TEST_DIR, 'opencode/.opencode/commands/new.md'))).toBe(true);
  });

  test('should log correct summary', () => {
    const consoleMock = mock(() => {});
    const originalLog = console.log;
    console.log = consoleMock;

    const commands = [{ name: 'cmd1', description: 'Test', args: [], body: 'body' }];
    const skills = [{ name: 'skill1', description: 'Test', license: '', body: 'body' }];

    transformOpenCode(commands, skills, TEST_DIR);

    console.log = originalLog;

    expect(consoleMock).toHaveBeenCalledWith('✓ OpenCode: 1 commands, 1 skills');
  });

  test('should log reference file count', () => {
    const consoleMock = mock(() => {});
    const originalLog = console.log;
    console.log = consoleMock;

    const skills = [
      {
        name: 'skill1',
        description: 'Test',
        license: '',
        body: 'body',
        references: [
          { name: 'ref1', content: 'ref1 content' },
          { name: 'ref2', content: 'ref2 content' }
        ]
      }
    ];

    transformOpenCode([], skills, TEST_DIR);

    console.log = originalLog;

    expect(consoleMock).toHaveBeenCalledWith('✓ OpenCode: 0 commands, 1 skills (2 reference files)');
  });

  test('should handle empty arrays', () => {
    transformOpenCode([], [], TEST_DIR);

    const commandFiles = fs.readdirSync(path.join(TEST_DIR, 'opencode/.opencode/commands'));
    const skillDirs = fs.readdirSync(path.join(TEST_DIR, 'opencode/.opencode/skills'));

    expect(commandFiles).toHaveLength(0);
    expect(skillDirs).toHaveLength(0);
  });

  test('should handle commands without args', () => {
    const commands = [
      {
        name: 'no-args',
        description: 'No args command',
        args: [],
        body: 'Body content'
      }
    ];

    transformOpenCode(commands, [], TEST_DIR);

    const content = fs.readFileSync(path.join(TEST_DIR, 'opencode/.opencode/commands/no-args.md'), 'utf-8');
    const parsed = parseFrontmatter(content);

    expect(parsed.frontmatter.description).toBe('No args command');
    expect(parsed.body).toBe('Body content');
  });

  test('should handle body without placeholders', () => {
    const commands = [
      {
        name: 'no-placeholders',
        description: 'No placeholders',
        args: [],
        body: 'Just plain text without any placeholders.'
      }
    ];

    transformOpenCode(commands, [], TEST_DIR);

    const content = fs.readFileSync(path.join(TEST_DIR, 'opencode/.opencode/commands/no-placeholders.md'), 'utf-8');
    const parsed = parseFrontmatter(content);

    expect(parsed.body).toBe('Just plain text without any placeholders.');
  });

  test('should preserve multiline body content', () => {
    const commands = [
      {
        name: 'multiline',
        description: 'Test',
        args: [],
        body: `First paragraph.

Second paragraph with details.

- List item 1
- List item 2`
      }
    ];

    transformOpenCode(commands, [], TEST_DIR);

    const content = fs.readFileSync(path.join(TEST_DIR, 'opencode/.opencode/commands/multiline.md'), 'utf-8');
    const parsed = parseFrontmatter(content);

    expect(parsed.body).toContain('First paragraph.');
    expect(parsed.body).toContain('Second paragraph');
    expect(parsed.body).toContain('- List item 1');
  });

  test('should support prefix option', () => {
    const commands = [
      { name: 'cmd', description: 'Test', args: [], body: 'body' }
    ];

    transformOpenCode(commands, [], TEST_DIR, null, { prefix: 'i-', outputSuffix: '-prefixed' });

    // Should use prefixed directory and command names
    expect(fs.existsSync(path.join(TEST_DIR, 'opencode-prefixed/.opencode/commands/i-cmd.md'))).toBe(true);
  });

  test('should include prefix in install script usage message', () => {
    transformOpenCode([], [], TEST_DIR, null, { prefix: 'i-' });

    const content = fs.readFileSync(path.join(TEST_DIR, 'opencode/install.sh'), 'utf-8');
    expect(content).toContain('/i-');
  });

  test('should create proper frontmatter structure', () => {
    const commands = [
      {
        name: 'test',
        description: 'Test command',
        args: [{ name: 'arg1', description: 'Arg 1', required: true }],
        body: 'Body'
      }
    ];

    transformOpenCode(commands, [], TEST_DIR);

    const content = fs.readFileSync(path.join(TEST_DIR, 'opencode/.opencode/commands/test.md'), 'utf-8');

    expect(content).toContain('---');
    expect(content).toContain('description: Test command');
    // Should NOT contain name or args in frontmatter
    expect(content).not.toMatch(/^name:/m);
    expect(content).not.toMatch(/^args:/m);
  });

  test('should handle skill with optional fields', () => {
    const skills = [
      {
        name: 'full-skill',
        description: 'A complete skill',
        license: 'Apache 2.0',
        compatibility: 'opencode',
        metadata: { author: 'test' },
        allowedTools: 'read,write',
        body: 'Skill body.'
      }
    ];

    transformOpenCode([], skills, TEST_DIR);

    const content = fs.readFileSync(path.join(TEST_DIR, 'opencode/.opencode/skills/full-skill/SKILL.md'), 'utf-8');
    const parsed = parseFrontmatter(content);

    expect(parsed.frontmatter.name).toBe('full-skill');
    expect(parsed.frontmatter.license).toBe('Apache 2.0');
    expect(parsed.frontmatter.compatibility).toBe('opencode');
  });
});
