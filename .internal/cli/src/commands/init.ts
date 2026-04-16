import { Command } from 'commander';
import { select, password, input } from '@inquirer/prompts';
import * as path from 'path';
import {
  getTemplates, getProviders, getTemplate,
  loadExternalManifest,
} from '../utils/manifest';
import type { ProviderEntry, TemplateEntry } from '../utils/manifest';
import { resolveFirecrawlApiKey } from '../utils/credentials';
import { scaffoldProject } from '../utils/scaffold';
import { printBanner, success, warn, info, dim, reset, green, bold } from '../utils/ui';
import { spawn } from 'child_process';

function resolveSpawnCommand(command: string): string {
  if (process.platform === 'win32' && command === 'npm') {
    return 'npm.cmd';
  }

  return command;
}

interface InitOptions {
  template?: string;
  provider?: string;
  model?: string;
  subAgentProvider?: string;
  subAgentModel?: string;
  from?: string;
  apiKey?: string;
  key?: string[];
  skipInstall?: boolean;
}

export function createInitCommand(): Command {
  return new Command('create')
    .aliases(['init'])
    .description('Create a new Firecrawl Agent project')
    .argument('[project-name]', 'Project directory name')
    .option('-t, --template <id>', 'Template (next, express, library)')
    .option('--provider <id>', 'Orchestrator model provider (anthropic, openai, google, custom-openai)')
    .option('--model <id>', 'Orchestrator model ID')
    .option('--sub-agent-provider <id>', 'Sub-agent model provider (defaults to orchestrator)')
    .option('--sub-agent-model <id>', 'Sub-agent model ID (defaults to orchestrator)')
    .option('--from <source>', 'External repo (user/repo) or local path with agent-manifest.json')
    .option('--api-key <key>', 'Firecrawl API key')
    .option('--key <provider=key>', 'Provider API key (repeatable, e.g. --key anthropic=sk-...)', collect, [])
    .option('--skip-install', 'Skip npm install')
    .addHelpText('after', `
Examples:
  $ firecrawl-agent create                                    # interactive
  $ firecrawl-agent create my-app -t next                     # Next.js with full UI
  $ firecrawl-agent create my-app -t next --provider openai   # choose the default provider
  $ firecrawl-agent create my-app -t express                  # Express API server
  $ firecrawl-agent create my-app -t library                   # library only
  $ firecrawl-agent create my-app -t express --api-key fc-... # with Firecrawl key
  $ firecrawl-agent create my-app -t next --key anthropic=sk-... --key openai=sk-...
  $ firecrawl-agent create my-app --from user/repo            # from external repo
  $ firecrawl-agent create my-app --from ./local-templates    # from local path
`)
    .action(async (projectName: string | undefined, options: InitOptions) => {
      await handleInit(projectName, options);
    });
}

function collect(val: string, acc: string[]): string[] {
  acc.push(val);
  return acc;
}

function getSelectedProvider(
  providers: ProviderEntry[],
  providerId?: string,
): ProviderEntry | undefined {
  return providers.find((provider) => provider.id === providerId);
}

function parseKeyFlags(keys: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  const providerEnvMap: Record<string, string> = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    google: 'GOOGLE_GENERATIVE_AI_API_KEY',
    gateway: 'AI_GATEWAY_API_KEY',
  };

  for (const entry of keys) {
    const eq = entry.indexOf('=');
    if (eq === -1) continue;
    const provider = entry.slice(0, eq).toLowerCase();
    const value = entry.slice(eq + 1);
    const envVar = providerEnvMap[provider] ?? provider.toUpperCase();
    map[envVar] = value;
  }
  return map;
}

/**
 * Prompt the user to pick a provider+model pair from the available manifest.
 * Used by both the initial orchestrator prompt and the review-loop "Change…"
 * actions so changes stay in sync.
 */
async function promptProviderAndModel(
  availableProviders: ProviderEntry[],
  message: string,
): Promise<{ provider: ProviderEntry; modelId: string }> {
  const providerId = await select({
    message,
    choices: availableProviders
      .filter((p) => p.models && p.models.length > 0)
      .map((provider) => ({
        name: `${provider.name}  ${dim}${provider.models[0].name}${reset}`,
        value: provider.id,
      })),
  });
  const provider = getSelectedProvider(availableProviders, providerId)!;

  let modelId: string;
  if (provider.id === 'custom-openai') {
    modelId = (await input({ message: 'Model ID', default: 'gpt-4o' })).trim() || 'gpt-4o';
  } else if (provider.models.length > 1) {
    modelId = await select({
      message: 'Model',
      choices: provider.models.map((m) => ({ name: m.name, value: m.id })),
    });
  } else {
    modelId = provider.models[0]?.id ?? 'gpt-4o';
  }

  return { provider, modelId };
}

async function handleInit(rawName: string | undefined, options: InitOptions): Promise<void> {
  printBanner();

  // --- Project name: arg > interactive prompt > default ---
  let projectName: string;

  if (rawName) {
    projectName = rawName;
  } else if (process.stdin.isTTY) {
    projectName = (await input({
      message: 'Project name',
      default: 'my-firecrawl-agent',
    })).trim() || 'my-firecrawl-agent';
  } else {
    projectName = 'my-firecrawl-agent';
  }

  // Load external manifest if --from is provided
  if (options.from) {
    try {
      await loadExternalManifest(options.from);
      success(`Loaded manifest from ${options.from}`);
    } catch (err) {
      warn(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
    console.log('');
  }

  const availableProviders = getProviders();

  // --- Template selection (only interactive prompt if not passed via flag) ---
  const templates = getTemplates();
  let template: TemplateEntry;

  if (options.template) {
    const found = getTemplate(options.template);
    if (!found) {
      warn(`Unknown template "${options.template}". Available: ${templates.map((t) => t.id).join(', ')}`);
      process.exit(1);
    }
    template = found;
  } else {
    const templateId = await select({
      message: 'Template',
      choices: templates.map((t) => ({
        name: `${t.name}  ${dim}${t.description}${reset}`,
        value: t.id,
      })),
    });
    template = getTemplate(templateId)!;
  }

  let selectedProvider = getSelectedProvider(availableProviders, options.provider);
  if (options.provider && !selectedProvider) {
    warn(`Unknown provider "${options.provider}". Available: ${availableProviders.map((p) => p.id).join(', ')}`);
    process.exit(1);
  }

  // If the user passed exactly one --key but no --provider, assume they
  // want that provider as the default. Matches the common "I have one key,
  // just set it up" mental model.
  if (!selectedProvider && options.key?.length) {
    const flagKeys = parseKeyFlags(options.key);
    const providerEnvVars = new Map(
      availableProviders.map((p) => [p.envVar, p.id]),
    );
    const matched = Object.keys(flagKeys)
      .map((envVar) => providerEnvVars.get(envVar))
      .filter((id): id is string => !!id);
    if (matched.length === 1) {
      selectedProvider = getSelectedProvider(availableProviders, matched[0]);
    }
  }

  if (!selectedProvider) {
    if (process.stdin.isTTY) {
      const providerId = await select({
        message: 'Default model provider',
        choices: availableProviders
          .filter((p) => p.models && p.models.length > 0)
          .map((provider) => ({
            name: `${provider.name}  ${dim}${provider.models[0].name}${reset}`,
            value: provider.id,
          })),
      });
      selectedProvider = getSelectedProvider(availableProviders, providerId)!;
    } else {
      selectedProvider = getSelectedProvider(availableProviders, 'google') ?? availableProviders[0];
    }
  }

  // --- Orchestrator model selection ---
  let selectedModelId: string;

  if (options.model) {
    selectedModelId = options.model;
  } else if (selectedProvider.id === 'custom-openai') {
    // Custom provider: let user type any model ID
    selectedModelId = (await input({
      message: 'Model ID',
      default: 'gpt-4o',
    })).trim();
  } else if (selectedProvider.models.length > 1 && process.stdin.isTTY) {
    selectedModelId = await select({
      message: 'Default model',
      choices: selectedProvider.models.map((m) => ({
        name: m.name,
        value: m.id,
      })),
    });
  } else {
    selectedModelId = selectedProvider.models[0]?.id ?? 'gpt-4o';
  }

  // --- Sub-agent model selection ---
  // Defaults to the orchestrator pair; user can override with flags or via
  // an interactive "same / different provider" prompt.
  let selectedSubProvider: ProviderEntry = selectedProvider;
  let selectedSubModelId: string = selectedModelId;

  if (options.subAgentProvider || options.subAgentModel) {
    const subProv = options.subAgentProvider
      ? getSelectedProvider(availableProviders, options.subAgentProvider)
      : selectedProvider;
    if (options.subAgentProvider && !subProv) {
      warn(`Unknown sub-agent provider "${options.subAgentProvider}". Available: ${availableProviders.map((p) => p.id).join(', ')}`);
      process.exit(1);
    }
    selectedSubProvider = subProv ?? selectedProvider;
    selectedSubModelId =
      options.subAgentModel ??
      (selectedSubProvider.id === selectedProvider.id ? selectedModelId : selectedSubProvider.models[0]?.id ?? selectedModelId);
  } else if (process.stdin.isTTY && !options.model) {
    // Only prompt interactively when the user also didn't fully specify the
    // orchestrator via flags — keeps fully-flagged invocations non-interactive.
    const subChoice = await select({
      message: 'Sub-agent model',
      choices: [
        { name: `Same as orchestrator  ${dim}(${selectedModelId})${reset}`, value: '__same__' },
        ...availableProviders.flatMap((p) =>
          p.models.map((m) => ({
            name: `${p.name} — ${m.name}`,
            value: `${p.id}::${m.id}`,
          }))
        ),
      ],
    });
    if (subChoice !== '__same__') {
      const [pId, mId] = subChoice.split('::');
      const p = getSelectedProvider(availableProviders, pId);
      if (p) {
        selectedSubProvider = p;
        selectedSubModelId = mId;
      }
    }
  }

  // --- Custom OpenAI endpoint ---
  let customEndpoint: string | undefined;
  if (selectedProvider.endpointEnvVar && process.stdin.isTTY) {
    customEndpoint = (await input({
      message: `Base URL ${dim}(OpenAI-compatible endpoint)${reset}`,
      default: 'https://api.openai.com/v1',
    })).trim() || undefined;
  }

  // --- Collect all env vars silently ---
  const envVars: Record<string, string> = {};
  const missing = new Set<string>();

  envVars.MODEL_PROVIDER = selectedProvider.id;
  envVars.MODEL_ID = selectedModelId;

  if (selectedProvider.endpointEnvVar && customEndpoint) {
    envVars[selectedProvider.endpointEnvVar] = customEndpoint;
  }

  // Firecrawl API key: flag > env > credentials > prompt
  if (options.apiKey) {
    envVars.FIRECRAWL_API_KEY = options.apiKey;
  } else {
    const resolved = await resolveFirecrawlApiKey();
    if (resolved) {
      envVars.FIRECRAWL_API_KEY = resolved.key;
    }
  }

  // Provider keys from --key flags
  const flagKeys = parseKeyFlags(options.key ?? []);
  Object.assign(envVars, flagKeys);

  // Auto-detect remaining provider keys from environment
  for (const provider of availableProviders) {
    if (!envVars[provider.envVar] && process.env[provider.envVar]) {
      envVars[provider.envVar] = process.env[provider.envVar]!;
    }
  }

  // Prompt for missing required keys when running interactively
  if (!envVars.FIRECRAWL_API_KEY) {
    const key = await password({
      message: `Firecrawl API key ${dim}(https://firecrawl.dev/app/api-keys)${reset}`,
    });
    if (key) {
      envVars.FIRECRAWL_API_KEY = key;
    } else {
      missing.add('FIRECRAWL_API_KEY');
    }
  }

  if (!envVars[selectedProvider.envVar] && process.stdin.isTTY) {
    const key = await password({
      message: `${selectedProvider.name} API key ${dim}(${selectedProvider.hint})${reset}`,
    });
    if (key) {
      envVars[selectedProvider.envVar] = key;
    } else {
      missing.add(selectedProvider.envVar);
    }
  }

  // Prompt for the sub-agent provider key when it's a different provider than
  // the orchestrator (same provider → same key, nothing new to collect).
  if (
    selectedSubProvider.id !== selectedProvider.id &&
    !envVars[selectedSubProvider.envVar] &&
    process.stdin.isTTY
  ) {
    const key = await password({
      message: `${selectedSubProvider.name} API key ${dim}(${selectedSubProvider.hint})${reset}`,
    });
    if (key) {
      envVars[selectedSubProvider.envVar] = key;
    } else {
      missing.add(selectedSubProvider.envVar);
    }
  }

  // Track what's missing for the summary
  for (const envVar of template.optionalEnvVars) {
    if (!envVars[envVar]) missing.add(envVar);
  }

  // --- Config summary review loop ---
  // Skip entirely for non-interactive / fully-flagged invocations.
  const fullyFlagged = !!(options.template && (options.apiKey || envVars.FIRECRAWL_API_KEY) && options.provider && options.model);
  if (process.stdin.isTTY && !fullyFlagged) {
    let confirmed = false;
    while (!confirmed) {
      printConfigSummary({
        template,
        orchProvider: selectedProvider,
        orchModelId: selectedModelId,
        subProvider: selectedSubProvider,
        subModelId: selectedSubModelId,
        envVars,
        missing,
      });
      const action = await select({
        message: 'Review',
        choices: [
          { name: 'Continue', value: 'continue' },
          { name: 'Change orchestrator model', value: 'orch' },
          { name: 'Change sub-agent model', value: 'sub' },
          { name: 'Cancel', value: 'cancel' },
        ],
      });
      if (action === 'cancel') {
        info('Cancelled.');
        process.exit(0);
      }
      if (action === 'orch') {
        const picked = await promptProviderAndModel(availableProviders, 'Orchestrator model');
        const prev = selectedProvider;
        selectedProvider = picked.provider;
        selectedModelId = picked.modelId;
        envVars.MODEL_PROVIDER = selectedProvider.id;
        envVars.MODEL_ID = selectedModelId;
        // Track missing key for the new orchestrator provider
        if (prev.envVar !== selectedProvider.envVar) {
          if (!envVars[selectedProvider.envVar]) {
            const key = await password({
              message: `${selectedProvider.name} API key ${dim}(${selectedProvider.hint})${reset}`,
            });
            if (key) envVars[selectedProvider.envVar] = key;
            else missing.add(selectedProvider.envVar);
          }
        }
        continue;
      }
      if (action === 'sub') {
        const sameChoice = await select({
          message: 'Sub-agent model',
          choices: [
            { name: `Same as orchestrator  ${dim}(${selectedModelId})${reset}`, value: '__same__' },
            { name: 'Different provider / model', value: '__different__' },
          ],
        });
        if (sameChoice === '__same__') {
          selectedSubProvider = selectedProvider;
          selectedSubModelId = selectedModelId;
        } else {
          const picked = await promptProviderAndModel(availableProviders, 'Sub-agent model');
          selectedSubProvider = picked.provider;
          selectedSubModelId = picked.modelId;
          if (
            selectedSubProvider.id !== selectedProvider.id &&
            !envVars[selectedSubProvider.envVar]
          ) {
            const key = await password({
              message: `${selectedSubProvider.name} API key ${dim}(${selectedSubProvider.hint})${reset}`,
            });
            if (key) envVars[selectedSubProvider.envVar] = key;
            else missing.add(selectedSubProvider.envVar);
          }
        }
        continue;
      }
      confirmed = true;
    }
  }

  // --- Scaffold ---
  const projectDir = path.resolve(process.cwd(), projectName);
  console.log('');
  info(`Creating a new Firecrawl Agent app in ${projectDir}`);
  console.log('');

  await scaffoldProject({
    projectDir,
    template,
    envVars,
    selectedProvider: selectedProvider.id,
    defaultModelId: envVars.MODEL_ID,
    subAgentProvider: selectedSubProvider.id,
    subAgentModelId: selectedSubModelId,
    skipInstall: options.skipInstall,
  });

  // --- Summary ---
  console.log('');
  console.log(`  ${green}${bold}Ready!${reset}  ${projectDir}`);
  console.log('');

  // Show detected keys
  const detected = Object.keys(envVars).filter((k) => /_API_KEY$/.test(k) && envVars[k]);
  if (detected.length > 0) {
    info(`Keys: ${detected.join(', ')}`);
  }
  info(`Orchestrator: ${selectedProvider.name} (${envVars.MODEL_ID})`);
  if (selectedSubProvider.id === selectedProvider.id && selectedSubModelId === selectedModelId) {
    info(`Sub-agent:    same as orchestrator`);
  } else {
    info(`Sub-agent:    ${selectedSubProvider.name} (${selectedSubModelId})`);
  }
  if (missing.size > 0) {
    info(`Missing: ${Array.from(missing).join(', ')} ${dim}(add to .env later)${reset}`);
  }
  console.log('');

  // --- What next? ---
  if (fullyFlagged || !process.stdin.isTTY) {
    console.log(`  cd ${projectName} && ${template.devCommand}`);
    console.log('');
    return;
  }

  const action = await select({
    message: 'Next',
    choices: [
      { name: `Start dev server  ${dim}${template.devCommand}${reset}`, value: 'dev' },
      { name: 'Exit', value: 'exit' },
    ],
  });

  if (action === 'dev') {
    console.log('');
    const [cmd, ...args] = template.devCommand.split(' ');
    spawn(resolveSpawnCommand(cmd), args, { cwd: projectDir, stdio: 'inherit' });
  } else {
    console.log(`  cd ${projectName} && ${template.devCommand}`);
    console.log('');
  }
}

/**
 * Render a compact config summary with orchestrator + sub-agent models up top,
 * followed by template + key status. Called inside the review loop before the
 * user picks "Continue" / "Change …".
 */
function printConfigSummary(args: {
  template: TemplateEntry;
  orchProvider: ProviderEntry;
  orchModelId: string;
  subProvider: ProviderEntry;
  subModelId: string;
  envVars: Record<string, string>;
  missing: Set<string>;
}): void {
  const { template, orchProvider, orchModelId, subProvider, subModelId, envVars, missing } = args;
  const sameAsOrch = subProvider.id === orchProvider.id && subModelId === orchModelId;
  const mask = (v?: string) => (v ? v.slice(0, 5) + '••••' + v.slice(-4) : '');
  console.log('');
  console.log(`  ${bold}Config${reset}`);
  console.log(`  ${dim}────────────────────────────────${reset}`);
  console.log(`  Orchestrator    ${green}${orchProvider.name}${reset} ${dim}·${reset} ${orchModelId}`);
  console.log(
    `  Sub-agent       ${green}${subProvider.name}${reset} ${dim}·${reset} ${subModelId}` +
      (sameAsOrch ? `   ${dim}(same as orchestrator)${reset}` : '')
  );
  console.log(`  Template        ${template.name}`);
  const fcKey = envVars.FIRECRAWL_API_KEY;
  console.log(
    `  Firecrawl key   ${fcKey ? `${mask(fcKey)}  ${green}✓${reset}` : `${dim}(missing)${reset}  !`}`
  );
  const orchKey = envVars[orchProvider.envVar];
  console.log(
    `  ${orchProvider.name} key` +
      ' '.repeat(Math.max(1, 14 - orchProvider.name.length - 4)) +
      (orchKey ? `${mask(orchKey)}  ${green}✓${reset}` : `${dim}(missing)${reset}  !`)
  );
  if (!sameAsOrch) {
    const subKey = envVars[subProvider.envVar];
    console.log(
      `  ${subProvider.name} key (sub)` +
        ' '.repeat(Math.max(1, 8 - subProvider.name.length)) +
        (subKey ? `${mask(subKey)}  ${green}✓${reset}` : `${dim}(missing)${reset}  !`)
    );
  }
  if (missing.size > 0) {
    console.log(`  ${dim}Other missing:  ${Array.from(missing).filter((m) => m !== orchProvider.envVar && m !== subProvider.envVar && m !== 'FIRECRAWL_API_KEY').join(', ') || '—'}${reset}`);
  }
  console.log('');
}
