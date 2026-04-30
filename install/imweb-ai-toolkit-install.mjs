#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, cpSync, lstatSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { homedir, platform } from 'node:os';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const MARKETPLACE_NAME = 'imweb-ai-toolkit';
const PLUGIN_ID = 'imweb-ai-toolkit@imweb-ai-toolkit';
const PUBLIC_GIT_SOURCE = 'https://github.com/imwebme/imweb-ai-toolkit.git';
const PUBLIC_GIT_REF = 'main';

const DEFAULTS = {
  tool: '',
  scope: 'user',
  skillMode: 'copy',
  skill: 'auto',
  installCli: false,
  skipCli: false,
  backup: true,
  replace: true,
  source: PUBLIC_GIT_SOURCE,
  ref: PUBLIC_GIT_REF,
  packagePath: '',
  skillPackagePath: '',
  mcpbPath: '',
  dryRun: false,
  json: false,
};

function usage() {
  console.log(`imweb-ai-toolkit installer

Usage:
  npx -y github:imwebme/imweb-ai-toolkit --tool cli|codex|claude-code|claude-desktop|claude-cowork|both|all [options]
  npm exec --yes --package github:imwebme/imweb-ai-toolkit -- imweb-ai-toolkit --tool cli|codex|claude-code|claude-desktop|claude-cowork|both|all [options]
  node install/imweb-ai-toolkit-install.mjs --tool cli|codex|claude-code|claude-desktop|claude-cowork|both|all [options]

Options:
  --tool cli|codex|claude|claude-code|claude-desktop|claude-cowork|both|all
                              Target AI surface. "claude" is an alias for Claude Code.
                              "cli" only installs or updates the imweb CLI.
                              "both" installs Codex + Claude Code. "claude-desktop" creates
                              the installable Claude Desktop .mcpb bundle. "claude-cowork"
                              creates the installable Cowork .plugin file and imweb .skill
                              fallback file. "all" also creates these packages.
  --scope user|project|local  Install scope for plugin tools. Default: user.
  --skill-mode copy|symlink   Skill install mode. Default: copy. Use copy for npx installs.
  --with-skill                Also install the imweb skill discovery bundle.
  --no-skill                  Skip skill discovery install.
  --install-cli               Install or update the imweb CLI before tool wiring.
  --no-install-cli            Skip the default CLI install/update for local plugin installs.
  --source SOURCE             Marketplace source. Default: ${PUBLIC_GIT_SOURCE}
  --ref REF                   Git ref for Codex marketplace add. Default: ${PUBLIC_GIT_REF}
  --package PATH              Create Claude Desktop Cowork plugin package. Use a .plugin
                              extension for installable Cowork file cards. Relative paths are
                              resolved from the directory where you run this command.
  --skill-package PATH        Create Claude Cowork imweb custom Skill fallback package. Use a .skill extension
                              for installable imweb skill cards. Relative paths are
                              resolved from the directory where you run this command.
  --mcpb PATH                 Create Claude Desktop MCPB bundle. Use a .mcpb extension.
                              Relative paths are resolved from the directory where you run
                              this command.
  --no-backup                 Skip timestamped backup of local Codex/Claude config paths.
  --no-replace                Do not replace existing imweb marketplace/plugin/skill entries.
  --dry-run                   Print actions without changing the machine.
  --json                      Print a machine-readable summary at the end.
  --help                      Show this help.

Notes:
  - Local plugin installs for Codex and Claude Code install/update the imweb CLI by default.
    Use --no-install-cli only for disposable metadata-only validation.
  - The default npx plugin path registers the public Git repository as the marketplace source.
  - Codex CLI currently supports marketplace registration; the installer also copies the
    imweb skill by default so command discovery works immediately.
  - Claude Code installs imweb-ai-toolkit from the registered marketplace.
  - Claude Desktop chat installs local MCP servers through a .mcpb bundle.
    The bundle bridge installs/updates the official imweb CLI automatically on first use.
  - Claude Desktop Cowork does not read Claude Code's CLI registry.
  - For Cowork, the default command creates imweb-ai-toolkit.plugin plus
    imweb.skill. Present both files to Cowork so the host can install/enable
    the plugin command and imweb Skill fallback; do not ask Cowork to use computer-use or
    Claude Desktop UI automation to install itself. Current Claude Desktop Cowork builds may
    reject slash text before the task starts, so after install use a natural-language request
    such as "최근 주문중 이상 거래 조사해줘. imweb AI Toolkit을 사용해줘."
  - Standard Agent Skills fallback is: npx skills add imwebme/imweb-ai-toolkit --skill imweb --copy -y --agent claude-code codex.`);
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const readValue = (name) => {
      if (i + 1 >= argv.length) fail(`${name} requires a value`);
      i += 1;
      return argv[i];
    };
    switch (arg) {
      case '--tool':
        opts.tool = normalizeTool(readValue(arg));
        break;
      case '--scope':
        opts.scope = readValue(arg);
        break;
      case '--skill-mode':
        opts.skillMode = readValue(arg);
        break;
      case '--with-skill':
        opts.skill = 'yes';
        break;
      case '--no-skill':
        opts.skill = 'no';
        break;
      case '--install-cli':
        opts.installCli = true;
        break;
      case '--no-install-cli':
        opts.skipCli = true;
        break;
      case '--source':
        opts.source = readValue(arg);
        break;
      case '--ref':
        opts.ref = readValue(arg);
        break;
      case '--package':
        opts.packagePath = readValue(arg);
        break;
      case '--skill-package':
        opts.skillPackagePath = readValue(arg);
        break;
      case '--mcpb':
        opts.mcpbPath = readValue(arg);
        break;
      case '--no-backup':
        opts.backup = false;
        break;
      case '--no-replace':
        opts.replace = false;
        break;
      case '--dry-run':
        opts.dryRun = true;
        break;
      case '--json':
        opts.json = true;
        break;
      case '--help':
      case '-h':
        usage();
        process.exit(0);
        break;
      default:
        fail(`unknown option: ${arg}`);
    }
  }
  if (!opts.tool && !opts.packagePath && !opts.skillPackagePath && !opts.mcpbPath) {
    fail('--tool, --package, --skill-package, or --mcpb is required');
  }
  if (opts.tool && !['cli', 'codex', 'claude', 'claude-desktop', 'claude-cowork', 'both', 'all'].includes(opts.tool)) {
    fail('--tool must be cli, codex, claude-code, claude-desktop, claude-cowork, both, or all');
  }
  if (!['user', 'project', 'local'].includes(opts.scope)) {
    fail('--scope must be user, project, or local');
  }
  if (!['copy', 'symlink'].includes(opts.skillMode)) {
    fail('--skill-mode must be copy or symlink');
  }
  return opts;
}

function normalizeTool(value) {
  const normalized = String(value || '').trim().toLowerCase();
  const aliases = {
    codex: 'codex',
    cli: 'cli',
    claude: 'claude',
    'claude-code': 'claude',
    'claude_cli': 'claude',
    'claude-cli': 'claude',
    'claude-desktop': 'claude-desktop',
    'claude-cowork': 'claude-cowork',
    cowork: 'claude-cowork',
    desktop: 'claude-desktop',
    both: 'both',
    all: 'all',
  };
  return aliases[normalized] || normalized;
}

function quote(value) {
  if (/^[A-Za-z0-9_./:@%+=,-]+$/.test(value)) return value;
  return JSON.stringify(value);
}

function run(command, args, opts, options = {}) {
  const printable = [command, ...args].map(String).map(quote).join(' ');
  opts.steps.push(printable);
  if (!opts.json) console.log(`+ ${printable}`);
  if (opts.dryRun) {
    return { status: 0, stdout: '', stderr: '' };
  }
  const capture = options.capture || opts.json;
  const result = spawnSync(command, args, {
    cwd: options.cwd || REPO_ROOT,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  if (result.error) {
    if (options.allowFailure) return { status: 1, stdout: '', stderr: String(result.error.message || result.error) };
    fail(`failed to run ${command}: ${result.error.message}`);
  }
  if (result.status !== 0 && !options.allowFailure) {
    fail(`command failed: ${printable}`);
  }
  return {
    status: result.status ?? 0,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function expandHome(path) {
  if (!path) return path;
  if (path === '~') return homedir();
  if (path.startsWith('~/')) return join(homedir(), path.slice(2));
  return path;
}

function resolveUserPath(path) {
  const expanded = expandHome(path);
  if (expanded.startsWith('/') || /^[A-Za-z]:[\\/]/.test(expanded)) {
    return resolve(expanded);
  }
  return resolve(process.cwd(), expanded);
}

function normalizeOptions(opts) {
  if ((opts.tool === 'claude-desktop' || opts.tool === 'all') && !opts.mcpbPath) {
    opts.mcpbPath = 'imweb-ai-toolkit.mcpb';
  }
  if ((opts.tool === 'claude-cowork' || opts.tool === 'all') && !opts.packagePath) {
    opts.packagePath = 'imweb-ai-toolkit.plugin';
  }
  if ((opts.tool === 'claude-cowork' || opts.tool === 'all') && !opts.skillPackagePath) {
    opts.skillPackagePath = 'imweb.skill';
  }
  if (opts.packagePath) {
    opts.packagePath = resolveUserPath(opts.packagePath);
  }
  if (opts.skillPackagePath) {
    opts.skillPackagePath = resolveUserPath(opts.skillPackagePath);
  }
  if (opts.mcpbPath) {
    opts.mcpbPath = resolveUserPath(opts.mcpbPath);
  }
  return opts;
}

function needsLocalBackup(opts) {
  return ['codex', 'claude', 'both', 'all'].includes(opts.tool);
}

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    '-',
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
}

function copyIfExists(source, backupRoot, copied) {
  const expanded = expandHome(source);
  if (!existsSync(expanded)) return;
  const label = expanded.replace(homedir(), 'home').replace(/^\/+/, '').replace(/[/:\\]/g, '__');
  const destination = join(backupRoot, label);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(expanded, destination, {
    recursive: true,
    dereference: false,
    preserveTimestamps: true,
    verbatimSymlinks: true,
  });
  copied.push({ source: expanded, backup: destination });
}

function createBackup(opts) {
  if (!opts.backup || opts.dryRun) return null;
  const root = join(homedir(), '.imweb-ai-toolkit-local-install-backups', `${timestamp()}-npx-install`);
  mkdirSync(root, { recursive: true });
  const copied = [];
  [
    '~/.codex/config.toml',
    '~/.codex/.codex-global-state.json',
    '~/.codex/skills/imweb',
    '~/.claude/plugins/config.json',
    '~/.claude/plugins/known_marketplaces.json',
    '~/.claude/plugins/installed_plugins.json',
    '~/.claude/skills/imweb',
  ].forEach((path) => copyIfExists(path, root, copied));
  opts.backupRoot = root;
  opts.backupEntries = copied;
  if (!opts.json) {
    console.log(`backup: ${root}`);
  }
  return root;
}

function commandExists(command) {
  const checker = platform() === 'win32' ? 'where' : 'sh';
  const args = platform() === 'win32'
    ? [command]
    : ['-c', 'command -v -- "$1" >/dev/null 2>&1', 'sh', command];
  const result = spawnSync(checker, args, { stdio: 'ignore' });
  return result.status === 0;
}

function requireCommand(command, opts) {
  if (opts.dryRun) return;
  if (!commandExists(command)) fail(`required command not found: ${command}`);
}

function isLocalSource(source) {
  return source.startsWith('/') || source.startsWith('./') || source.startsWith('../') || source.startsWith('~') || /^[A-Za-z]:[\\/]/.test(source);
}

function psCommand() {
  if (commandExists('pwsh')) return 'pwsh';
  if (platform() === 'win32' && commandExists('powershell')) return 'powershell';
  return 'pwsh';
}

function runScript(scriptBase, shellArgs, psArgs, opts) {
  if (platform() === 'win32') {
    const ps = psCommand();
    requireCommand(ps, opts);
    run(ps, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', join(REPO_ROOT, 'install', `${scriptBase}.ps1`), ...psArgs], opts);
    return;
  }
  requireCommand('bash', opts);
  run('bash', [join(REPO_ROOT, 'install', `${scriptBase}.sh`), ...shellArgs], opts);
}

function defaultSkillTarget(tool, scope) {
  if (scope === 'project') {
    return join(process.cwd(), tool === 'codex' ? '.codex/skills' : '.claude/skills');
  }
  if (tool === 'codex') {
    return join(process.env.CODEX_HOME || join(homedir(), '.codex'), 'skills');
  }
  return join(homedir(), '.claude', 'skills');
}

function removeSkillIfReplacing(tool, opts) {
  if (!opts.replace) return;
  const target = join(defaultSkillTarget(tool, opts.scope), 'imweb');
  if (!existsSync(target)) return;
  if (!opts.json) console.log(`replace existing skill: ${target}`);
  if (!opts.dryRun) {
    const stat = lstatSync(target);
    rmSync(target, { recursive: stat.isDirectory() && !stat.isSymbolicLink(), force: true });
  }
}

function installSkill(tool, opts) {
  removeSkillIfReplacing(tool, opts);
  const target = defaultSkillTarget(tool, opts.scope);
  const shellArgs = ['--tool', tool, '--scope', opts.scope === 'local' ? 'project' : opts.scope, '--mode', opts.skillMode, '--target', target];
  const psArgs = ['-Tool', tool, '-Scope', opts.scope === 'local' ? 'project' : opts.scope, '-Mode', opts.skillMode, '-Target', target];
  runScript('install-skills', shellArgs, psArgs, opts);
}

function installCli(opts) {
  runScript('install-cli', [], [], opts);
}

function shouldInstallCli(opts) {
  if (opts.skipCli) return false;
  if (opts.installCli || opts.tool === 'cli') return true;
  return ['codex', 'claude', 'both', 'all'].includes(opts.tool);
}

function createPackage(opts) {
  const output = opts.packagePath;
  if (!output) return;
  runScript('install-plugins', ['--package', output], ['-Package', output], opts);
}

function createSkillPackage(opts) {
  const output = opts.skillPackagePath;
  if (!output) return;
  runScript('install-plugins', ['--skill-package', output], ['-SkillPackage', output], opts);
}

function createMcpbPackage(opts) {
  const output = opts.mcpbPath;
  if (!output) return;
  runScript('install-plugins', ['--mcpb', output], ['-Mcpb', output], opts);
}

function installCodex(opts) {
  requireCommand('codex', opts);
  if (opts.replace) {
    run('codex', ['plugin', 'marketplace', 'remove', MARKETPLACE_NAME], opts, { allowFailure: true, capture: true });
  }
  const addArgs = ['plugin', 'marketplace', 'add'];
  if (opts.ref && !isLocalSource(opts.source)) {
    addArgs.push('--ref', opts.ref);
  }
  addArgs.push(expandHome(opts.source));
  run('codex', addArgs, opts);
}

function installClaude(opts) {
  requireCommand('claude', opts);
  if (opts.replace) {
    run('claude', ['plugin', 'uninstall', PLUGIN_ID, '--scope', opts.scope, '--keep-data', '-y'], opts, { allowFailure: true, capture: true });
    run('claude', ['plugin', 'marketplace', 'remove', MARKETPLACE_NAME], opts, { allowFailure: true, capture: true });
  }
  run('claude', ['plugin', 'marketplace', 'add', expandHome(opts.source)], opts);
  run('claude', ['plugin', 'install', PLUGIN_ID, '--scope', opts.scope], opts);
}

function shouldInstallSkill(tool, opts) {
  if (opts.skill === 'yes') return true;
  if (opts.skill === 'no') return false;
  return tool === 'codex' || tool === 'claude';
}

function main() {
  const opts = normalizeOptions(parseArgs(process.argv.slice(2)));
  opts.steps = [];
  opts.backupRoot = null;
  opts.backupEntries = [];

  if (needsLocalBackup(opts)) {
    createBackup(opts);
  }

  if (shouldInstallCli(opts)) {
    installCli(opts);
  }

  if (opts.packagePath) {
    createPackage(opts);
  }

  if (opts.skillPackagePath) {
    createSkillPackage(opts);
  }

  if (opts.mcpbPath) {
    createMcpbPackage(opts);
  }

  const tools = (opts.tool === 'both' || opts.tool === 'all') ? ['codex', 'claude'] : (['codex', 'claude'].includes(opts.tool) ? [opts.tool] : []);
  for (const tool of tools) {
    if (tool === 'codex') installCodex(opts);
    if (tool === 'claude') installClaude(opts);
    if (shouldInstallSkill(tool, opts)) installSkill(tool, opts);
  }

  const summary = {
    ok: true,
    packageRoot: REPO_ROOT,
    marketplaceSource: opts.source,
    ref: opts.ref,
    tool: opts.tool || null,
    scope: opts.scope,
    skillMode: opts.skillMode,
    backupRoot: opts.backupRoot,
    packagePath: opts.packagePath || null,
    skillPackagePath: opts.skillPackagePath || null,
    mcpbPath: opts.mcpbPath || null,
    steps: opts.steps,
  };

  if (opts.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log('imweb-ai-toolkit install completed');
    if (opts.backupRoot) console.log(`  backup: ${opts.backupRoot}`);
    console.log(`  marketplace_source: ${opts.source}`);
    if (opts.tool) console.log(`  tool: ${opts.tool}`);
    if (opts.packagePath) console.log(`  package: ${opts.packagePath}`);
    if (opts.skillPackagePath) console.log(`  skill_package: ${opts.skillPackagePath}`);
    if (opts.mcpbPath) console.log(`  mcpb: ${opts.mcpbPath}`);
  }
}

main();
