const endpoint = process.env.CI_API_V4_URL;
// fallback to developer token for dry runs
const token =
  process.env.TOKEN_GITHUB
const githubToken = process.env.GITHUB_TOKEN;
const dryRun = process.env.DRY_RUN !== "false";
const autodiscoverFilter = process.env.AUTODISCOVER_FILTER;
const apaxNpmrc = process.env.APAX_NPMRC;

const prFooter = `:space_invader: :sparkles: This merge request is proudly presented by [Renovate Bot](https://code.siemens.com/ax/devops/renovate-bot).`;

module.exports = {
  extends: [
    ":dependencyDashboard",
    ":semanticPrefixFixDepsChoreOthers",
    ":autodetectPinVersions",
    "group:allNonMajor",
    "group:monorepos",
    "group:recommended",
    "workarounds:all",
    ":prHourlyLimitNone",
    ":prConcurrentLimitNone",
  ],
  platform: "github",
  platformAutomerge: true,
  endpoint: endpoint,
  token: token,
  gitAuthor: "AX Bot <botax.industry@siemens.com>",
  dryRun: dryRun,
  prFooter: prFooter,
  allowPostUpgradeCommandTemplating: true,
  allowedPostUpgradeCommands: [".+"],
  assigneesFromCodeOwners: true,
  assigneesSampleSize: 1,
  autodiscover: !!autodiscoverFilter,
  autodiscoverFilter: autodiscoverFilter,
  ignorePaths: [
    "**/node_modules/**",
    "**/bower_components/**",
    "**/vendor/**",
    "**/examples/**",
    "**/__tests__/**",
    "**/__fixtures__/**",
  ],
  rangeStrategy: "pin",
  pinDigests: true,
  logFile: process.env.LOG_FILE,
  logFileLevel: process.env.LOG_FILE_LEVEL || "debug",
  cacheDir: process.env.CACHE_DIR,
  dependencyDashboard: true,
  allowScripts: true,
  exposeAllEnv: true,
  ignoreScripts: true,
  filterUnavailableUsers: true,
  npmrc: process.env.NPMRC,
  labels: ["renovate", `renovate-v${process.env.VERSION}`],
  gitlabci: {
    fileMatch: ["\\.gitlab-ci\\.yml$"],
  },
  "gitlabci-include": {
    fileMatch: ["\\.gitlab-ci\\.yml$"],
  },
  regexManagers: [
    {
      fileMatch: ["(^|\\/)(test.|test-windows.)?apax.ya?ml$"],
      matchStrings: [
        // We're using `String.raw` here so that the RegEx can be easily copied from/to other tools (e.g. https://regex101.com/)
        String.raw`"(?<depName>@ax\/.*?)"\s*:\s*"?(?<currentValue>[\d\.^\-\w]*)"?`,
      ],
      datasourceTemplate: "npm",
      // Unfortunately setting the registryUrl here does not work properly.
      // The registry can only be set via the `npmrc` property in the package rules.
      // Seems to be an NPM-specific weird behavior of Renovate, maybe related to
      // https://github.com/renovatebot/renovate/issues/4224
      // registryUrlTemplate: "https://axciteme.siemens.com/registry/apax/"
    },
    {
      fileMatch: ["(^|\\/)(test.|test-windows.)?apax.ya?ml$"],
      matchStrings: [
        // We're using `String.raw` here so that the RegEx can be easily copied from/to other tools (e.g. https://regex101.com/)
        String.raw`#\s*renovate:\s+datasource=(?<datasource>.*?)\s+depName=(?<depName>[\.\w]+)[\s-]+[\w]+_VERSION\s*=\s*"?(?<currentValue>[\d\.^\-\w]*)"?`,
      ],      
    },
    {
      fileMatch: ["^terragrunt\\.hcl$"],
      matchStrings: [
        // We're using `String.raw` here so that the RegEx can be easily copied from/to other tools (e.g. https://regex101.com/)
        String.raw`#\s*renovate:\s+datasource=(?<datasource>.*?) depName=(?<depName>.*?)\sregistryUrl=(?<registryUrl>.*?)\s.*?_version\s*=\s*"(?<currentValue>.*)"\s`,
      ],
      versioningTemplate:
        "{{#if versioning}}{{{versioning}}}{{else}}semver{{/if}}",
    },
    {
      fileMatch: ["(^|\\/)pyproject\\.toml$"],
      matchStrings: [
        // We're using `String.raw` here so that the RegEx can be easily copied from/to other tools (e.g. https://regex101.com/)
        String.raw`#\s*renovate:\s+datasource=(?<datasource>.*?) depName=(?<depName>.*?)\sregistryUrl=(?<registryUrl>.*?)\s.*?\.git@(?<currentValue>.*)"`,
      ],
      versioningTemplate:
        "{{#if versioning}}{{{versioning}}}{{else}}semver{{/if}}",
    },
    {
      fileMatch: ["^Dockerfile$"],
      matchStrings: [
        // We're using `String.raw` here so that the RegEx can be easily copied from/to other tools (e.g. https://regex101.com/)
        String.raw`datasource=(?<datasource>.*?) depName=(?<depName>.*?)( versioning=(?<versioning>.*?))?\sENV .*?_VERSION=(?<currentValue>.*)\s`,
      ],
      versioningTemplate:
        "{{#if versioning}}{{{versioning}}}{{else}}semver{{/if}}",
    },
    {
      fileMatch: ["^Dockerfile$"],
      matchStrings: [
        // We're using `String.raw` here so that the RegEx can be easily copied from/to other tools (e.g. https://regex101.com/)
        String.raw`ARG IMAGE=(?<depName>.*?):(?<currentValue>.*?)@(?<currentDigest>sha256:[a-f0-9]+)s`,
      ],
      datasourceTemplate: "docker",
    },
    {
      fileMatch: [".gitlab-ci.ya?ml$"],
      matchStrings: [
        // We're using `String.raw` here so that the RegEx can be easily copied from/to other tools (e.g. https://regex101.com/)
        String.raw`datasource=(?<datasource>.*?) depName=(?<depName>.*?)( versioning=(?<versioning>.*?))?\s.*?_VERSION:\s*"?(?<currentValue>[^(\"|\n|@)]*)(?:@(?<currentDigest>[^(\"|\n)]*))?"?\s`,
      ],
      versioningTemplate:
        "{{#if versioning}}{{{versioning}}}{{else}}semver{{/if}}",
    },
  ],
  hostRules: [
    {
      matchHost: "github.com",
      token: githubToken,
    },
  ],
  // Note that package rules are combined from top to bottom (in case of conflicts later rules take precedence)
  // See https://docs.renovatebot.com/configuration-options/#packagerules for some more information.
  packageRules: [
    {
      // Ensure that SemVer ranges for engines are preserved.
      matchDepTypes: ["engines"],
      rangeStrategy: "replace",
    },
    {
      // Create a proper change link for dependencies from code.siemens.com
      matchSourceUrlPrefixes: ["https://code.siemens.com"],
      prBodyDefinitions: {
        // Inspired by what Renovate does for NPM packages, see https://github.com/renovatebot/renovate/blob/59d140fc25dda4bd89057f5f3a948a6849667762/lib/manager/npm/index.ts#L16
        Change:
          "[{{#if displayFrom}}`{{{displayFrom}}}` -> {{else}}{{#if currentValue}}`{{{currentValue}}}` -> {{/if}}{{/if}}{{#if displayTo}}`{{{displayTo}}}`{{else}}`{{{newValue}}}`{{/if}}]({{#if sourceUrl}}{{replace '.git' '' sourceUrl}}/-/compare/{{{currentVersion}}}...{{{newVersion}}}{{/if}})",
      },
    },
    {
      // Ensure that internal packages are automerged and ignore dependency freeze for those.
      matchSourceUrlPrefixes: ["https://code.siemens.com/ax"],
      addLabels: ["ignore-dependency-freeze"],
      automerge: true,
    },
    {
      matchPackagePatterns: ["^@types\\/"],
      matchLanguages: ["js"],
      groupName: "TS Types",
    },
    {
      // Keep the VS Code types separate because this dependency usually
      // needs to be updated together with the "engines" field.
      matchPackageNames: ["@types/vscode"],
      matchLanguages: ["js"],
      // ⚠⚠⚠ Global AX contract regarding VS Code compatibility ⚠⚠⚠
      allowedVersions: "<=1.72",
      groupName: "VS Code API",
    },
    {
      matchPackageNames: [
        "eslint",
        "tslint",
        "prettier",
        "pretty-quick",
        "markdownlint-cli",
        "remark-cli",
        "remark-validate-links",
      ],
      matchPackagePatterns: [
        "^eslint-config-",
        "^eslint-plugin-",
        "^@typescript-eslint\\/",
      ],
      matchLanguages: ["js"],
      groupName: "Linters and Formatters",
    },
    {
      matchPackageNames: ["dotnet"],
      matchUpdateTypes: ["major"],
      enabled: false
    },
    {
      matchPackagePatterns: ["^SpecFlow"],
      groupName: "SpecFlow",
    },
    {
      // Set endpoint and credentials for the Apax registry
      matchPaths: ["**/{test.,test-windows.,}apax.y{a,}ml"],
      npmrc: apaxNpmrc,
    },
    {
      // Ensure lock files are updated
      matchPaths: ["**/apax.y{a,}ml"],
      postUpgradeTasks: {
        // Switch to the directory of the apax.yml and update the lock file if it exists.
        commands: [
          `
          cd ./{{{packageFileDir}}} && 
          if test -f apax-lock.json; then 
            if apax install --update-lockfile --ignore-scripts; then
              echo Successfully updated lock file.
            else
              echo Failed to update lock file.
            fi
          else
            echo No lock file to update.
          fi
        `,
        ],
        fileFilters: ["**/apax-lock.json"],
      },
    },
    {
      // Ignore intermediate versions
      matchCurrentVersion: "/^0\\.0\\.0-replace-in-pipeline$/",
      enabled: false,
    },
    {
      // ignore invalid package that IS unlisted and should not reside in artifactory to begin with
      matchPackagePatterns: ["^system.componentmodel.composition"],
      allowedVersions: "!/2010.2.11/",
    },
  ],
};
