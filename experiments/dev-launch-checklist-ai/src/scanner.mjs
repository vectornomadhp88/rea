import fs from "node:fs/promises";
import path from "node:path";

const CHECK_WEIGHT = 20;

async function fileExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function readTextIfExists(target) {
  if (!(await fileExists(target))) return null;
  return fs.readFile(target, "utf8");
}

async function listFilesRecursive(
  root,
  maxDepth = 5,
  currentDepth = 0,
  acc = [],
) {
  if (currentDepth > maxDepth) return acc;
  let entries = [];
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return acc;
  }

  for (const entry of entries) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".git" ||
      entry.name === "dist"
    )
      continue;
    const fullPath = path.join(root, entry.name);
    const relPath = path.relative(root, fullPath);
    if (entry.isFile()) {
      acc.push(relPath);
      continue;
    }
    if (entry.isDirectory()) {
      await listFilesRecursive(fullPath, maxDepth, currentDepth + 1, acc);
    }
  }

  return acc;
}

function checkResult(name, score, status, findings, evidence, suggestions) {
  return { name, score, status, findings, evidence, suggestions };
}

async function checkReadmeQuality(repoPath) {
  const readmePath = path.join(repoPath, "README.md");
  const readme = await readTextIfExists(readmePath);

  if (!readme) {
    return checkResult(
      "README quality",
      0,
      "needs-work",
      ["README.md is missing."],
      [],
      [
        "Create README.md with problem statement, installation, usage, and examples.",
      ],
    );
  }

  const headings = (readme.match(/^#{1,6}\s+/gm) ?? []).length;
  const hasInstall = /install|setup|quick start/i.test(readme);
  const hasUsage = /usage|example|how to use/i.test(readme);
  const score =
    Math.min(CHECK_WEIGHT, headings >= 5 ? 20 : headings >= 3 ? 14 : 8) +
    (hasInstall ? 0 : -4) +
    (hasUsage ? 0 : -4);

  const normalizedScore = Math.max(0, Math.min(CHECK_WEIGHT, score));
  return checkResult(
    "README quality",
    normalizedScore,
    normalizedScore >= 16
      ? "healthy"
      : normalizedScore >= 10
        ? "warning"
        : "needs-work",
    [
      `Detected ${headings} markdown heading(s).`,
      `Installation/setup section: ${hasInstall ? "present" : "missing"}.`,
      `Usage/examples section: ${hasUsage ? "present" : "missing"}.`,
    ],
    ["README.md"],
    [
      !hasInstall ? "Add a clear install/setup section." : null,
      !hasUsage ? "Add usage examples with copy-paste commands." : null,
      headings < 5
        ? "Add structured sections (problem, features, quick start, FAQ)."
        : null,
    ].filter(Boolean),
  );
}

async function checkTestsPresence(repoPath, files) {
  const testMatches = files.filter((file) =>
    /(^|\/)(test|tests|__tests__)(\/|$)|\.test\.|\.spec\./i.test(file),
  );

  const score =
    testMatches.length === 0
      ? 0
      : testMatches.length < 3
        ? 10
        : testMatches.length < 10
          ? 16
          : 20;
  return checkResult(
    "Tests presence",
    score,
    score >= 16 ? "healthy" : score >= 10 ? "warning" : "needs-work",
    [`Detected ${testMatches.length} test-related file(s)/path(s).`],
    testMatches.slice(0, 8),
    score === 20
      ? []
      : [
          "Add smoke tests for main user flow.",
          "Ensure CI runs tests on every PR.",
          "Add at least one regression test per resolved bug.",
        ],
  );
}

async function checkCiHealth(repoPath) {
  const workflowsPath = path.join(repoPath, ".github", "workflows");
  const workflowsExist = await fileExists(workflowsPath);
  if (!workflowsExist) {
    return checkResult(
      "CI health",
      0,
      "needs-work",
      ["No .github/workflows directory found."],
      [],
      [
        "Add at least one CI workflow for lint + tests on pull_request and push.",
      ],
    );
  }

  const workflowFiles = (await fs.readdir(workflowsPath)).filter(
    (name) => name.endsWith(".yml") || name.endsWith(".yaml"),
  );
  const contents = await Promise.all(
    workflowFiles.map(async (fileName) => {
      const fullPath = path.join(workflowsPath, fileName);
      return {
        fileName,
        content: (await readTextIfExists(fullPath)) ?? "",
      };
    }),
  );

  const hasPullRequestTrigger = contents.some(({ content }) =>
    /\bpull_request\b/.test(content),
  );
  const hasPushTrigger = contents.some(({ content }) =>
    /\bpush\b/.test(content),
  );
  const hasTestCommand = contents.some(({ content }) =>
    /npm\s+run\s+test|vitest|pytest|go\s+test|cargo\s+test|mvn\s+test/i.test(
      content,
    ),
  );

  let score = CHECK_WEIGHT;
  if (workflowFiles.length === 0) score -= 10;
  if (!hasPullRequestTrigger) score -= 4;
  if (!hasPushTrigger) score -= 3;
  if (!hasTestCommand) score -= 3;
  score = Math.max(0, score);

  return checkResult(
    "CI health",
    score,
    score >= 16 ? "healthy" : score >= 10 ? "warning" : "needs-work",
    [
      `Workflow files detected: ${workflowFiles.length}.`,
      `pull_request trigger: ${hasPullRequestTrigger ? "yes" : "no"}.`,
      `push trigger: ${hasPushTrigger ? "yes" : "no"}.`,
      `Automated test command detected: ${hasTestCommand ? "yes" : "no"}.`,
    ],
    workflowFiles.map((name) => `.github/workflows/${name}`),
    [
      !hasPullRequestTrigger
        ? "Run CI on pull requests to block broken changes."
        : null,
      !hasPushTrigger ? "Run CI on push for direct branch validation." : null,
      !hasTestCommand ? "Add an explicit test step in CI workflow." : null,
    ].filter(Boolean),
  );
}

async function checkDependencyRisk(repoPath, files) {
  const packageJsonPath = path.join(repoPath, "package.json");
  const packageLockPath = path.join(repoPath, "package-lock.json");
  const requirementsTxtPath = path.join(repoPath, "requirements.txt");

  const packageJsonRaw = await readTextIfExists(packageJsonPath);
  const requirementsRaw = await readTextIfExists(requirementsTxtPath);
  const hasLockfile = await fileExists(packageLockPath);

  let score = CHECK_WEIGHT;
  const findings = [];
  const evidence = [];
  const suggestions = [];

  if (packageJsonRaw) {
    evidence.push("package.json");
    let parsed;
    try {
      parsed = JSON.parse(packageJsonRaw);
    } catch {
      parsed = null;
      score -= 6;
      findings.push("package.json exists but is not valid JSON.");
      suggestions.push("Fix package.json syntax to enable dependency tooling.");
    }

    if (parsed) {
      const depCount =
        Object.keys(parsed.dependencies ?? {}).length +
        Object.keys(parsed.devDependencies ?? {}).length;
      findings.push(`Node dependencies declared: ${depCount}.`);
      if (!hasLockfile) {
        score -= 5;
        suggestions.push(
          "Commit a lockfile (package-lock.json/pnpm-lock.yaml/yarn.lock).",
        );
      } else {
        evidence.push("package-lock.json");
      }
    }
  }

  if (requirementsRaw) {
    evidence.push("requirements.txt");
    const lines = requirementsRaw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    const unpinned = lines.filter((line) => !/(==|~=|>=|<=)/.test(line));
    findings.push(
      `Python requirements entries: ${lines.length}; unpinned: ${unpinned.length}.`,
    );
    if (unpinned.length > 0) {
      score -= Math.min(6, unpinned.length);
      suggestions.push(
        "Pin Python dependency versions to improve reproducibility.",
      );
    }
  }

  if (!packageJsonRaw && !requirementsRaw) {
    findings.push("No package.json or requirements.txt detected.");
    score -= 4;
    suggestions.push(
      "Document dependency and environment management strategy.",
    );
  }

  const potentialWorkflowLocks = files.filter((file) =>
    /pnpm-lock\.yaml|yarn\.lock|poetry\.lock|Pipfile\.lock/i.test(file),
  );
  if (potentialWorkflowLocks.length > 0) {
    evidence.push(...potentialWorkflowLocks.slice(0, 3));
  }

  score = Math.max(0, Math.min(CHECK_WEIGHT, score));
  return checkResult(
    "Dependency risk",
    score,
    score >= 16 ? "healthy" : score >= 10 ? "warning" : "needs-work",
    findings,
    [...new Set(evidence)],
    suggestions,
  );
}

async function checkReleaseReadiness(repoPath) {
  const expectedFiles = [
    "LICENSE",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "SECURITY.md",
  ];
  const present = [];
  const missing = [];

  for (const file of expectedFiles) {
    const full = path.join(repoPath, file);
    if (await fileExists(full)) {
      present.push(file);
    } else {
      missing.push(file);
    }
  }

  let score = CHECK_WEIGHT - missing.length * 4;
  score = Math.max(0, score);

  return checkResult(
    "Release readiness",
    score,
    score >= 16 ? "healthy" : score >= 10 ? "warning" : "needs-work",
    [
      `Release hygiene files present: ${present.length}/${expectedFiles.length}.`,
      missing.length > 0
        ? `Missing: ${missing.join(", ")}.`
        : "All baseline release files detected.",
    ],
    present,
    missing.map((file) => `Add ${file} for contributor and user trust.`),
  );
}

function summarize(results) {
  const total = results.reduce((sum, result) => sum + result.score, 0);
  const grade =
    total >= 85
      ? "A"
      : total >= 70
        ? "B"
        : total >= 55
          ? "C"
          : total >= 40
            ? "D"
            : "E";
  return { total, grade };
}

function toMarkdown({
  target,
  generatedAt,
  summary,
  results,
  includeFixSuggestions,
}) {
  const lines = [];
  lines.push(`# Project Readiness Report`);
  lines.push("");
  lines.push(`- **Target:** ${target}`);
  lines.push(`- **Generated at:** ${generatedAt}`);
  lines.push(
    `- **Overall score:** ${summary.total}/100 (grade ${summary.grade})`,
  );
  lines.push("");
  lines.push("## Scorecard");
  lines.push("");
  lines.push("| Module | Score | Status |");
  lines.push("| --- | ---: | --- |");
  for (const result of results) {
    lines.push(`| ${result.name} | ${result.score}/20 | ${result.status} |`);
  }

  for (const result of results) {
    lines.push("");
    lines.push(`## ${result.name}`);
    lines.push("");
    for (const finding of result.findings) {
      lines.push(`- ${finding}`);
    }
    if (result.evidence.length > 0) {
      lines.push("");
      lines.push("Evidence:");
      for (const item of result.evidence) {
        lines.push(`- \`${item}\``);
      }
    }
    if (includeFixSuggestions && result.suggestions.length > 0) {
      lines.push("");
      lines.push("Fix suggestions (non-destructive):");
      for (const suggestion of result.suggestions) {
        lines.push(`- ${suggestion}`);
      }
    }
  }

  lines.push("");
  lines.push("## Privacy mode");
  lines.push("");
  lines.push("- Local-only scan: no repository code is uploaded by this CLI.");
  lines.push(
    "- URL inputs are not fetched in this MVP; provide a local checkout path.",
  );

  return lines.join("\n");
}

export async function runScan(target, options = {}) {
  const generatedAt = new Date().toISOString();

  if (/^https?:\/\//i.test(target)) {
    const report = {
      target,
      generatedAt,
      summary: { total: 0, grade: "E" },
      results: [
        checkResult(
          "Target resolution",
          0,
          "needs-work",
          ["This MVP works with local filesystem paths only."],
          [],
          ["Clone the repository locally and rerun with an absolute path."],
        ),
      ],
    };
    return {
      ...report,
      markdown: toMarkdown({
        ...report,
        includeFixSuggestions: options.fixSuggestions === true,
      }),
    };
  }

  const repoPath = path.resolve(target);
  const stat = await fs.stat(repoPath).catch(() => null);
  if (!stat || !stat.isDirectory()) {
    throw new Error(`Target is not a directory: ${repoPath}`);
  }

  const files = await listFilesRecursive(repoPath, 5);
  const results = await Promise.all([
    checkReadmeQuality(repoPath),
    checkTestsPresence(repoPath, files),
    checkCiHealth(repoPath),
    checkDependencyRisk(repoPath, files),
    checkReleaseReadiness(repoPath),
  ]);

  const summary = summarize(results);
  const report = {
    target: repoPath,
    generatedAt,
    summary,
    results,
  };

  return {
    ...report,
    markdown: toMarkdown({
      ...report,
      includeFixSuggestions: options.fixSuggestions === true,
    }),
  };
}
