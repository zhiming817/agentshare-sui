const SANITIZE_PATTERNS = [
  /<command-name>[^<]*<\/command-name>/g,
  /<command-message>[^<]*<\/command-message>/g,
  /<command-args>[^<]*<\/command-args>/g,
  /<local-command-stdout>[^<]*<\/local-command-stdout>/g,
  /<system-reminder>[\s\S]*?<\/system-reminder>/g,
  /^\s*Caveat:[\s\S]*?unless the user explicitly asks you to\./,
];

// Sensitive info redaction patterns
const SENSITIVE_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Database connection strings
  {
    pattern: /(postgresql|postgres|mysql|mongodb|redis):\/\/[^\s"'\]]+/g,
    replacement: "$1://***REDACTED***",
  },
  {
    pattern: /(DATABASE_URL|DB_HOST|DB_PASSWORD|DB_USER)\s*=\s*"[^"]*"/g,
    replacement: '$1="***REDACTED***"',
  },
  // API keys and tokens
  {
    pattern: /(Bearer\s+)[\w\-._~+/]+=*/g,
    replacement: "$1***REDACTED***",
  },
  {
    pattern: /((?:api[_-]?key|apikey|api[_-]?secret|access[_-]?token|auth[_-]?token)\s*[:=]\s*["']?)[\w\-._~+/]+["']?/gi,
    replacement: "$1***REDACTED***",
  },
  {
    pattern: /\bsk-[a-zA-Z0-9]{20,}\b/g,
    replacement: "sk-***REDACTED***",
  },
  {
    pattern: /\bnpg_[a-zA-Z0-9]{20,}\b/g,
    replacement: "npg_***REDACTED***",
  },
  {
    pattern: /\bghp_[a-zA-Z0-9]{36}\b/g,
    replacement: "ghp_***REDACTED***",
  },
  {
    pattern: /\bgho_[a-zA-Z0-9]{36}\b/g,
    replacement: "gho_***REDACTED***",
  },
  // Passwords and secrets
  {
    pattern: /((?:password|passwd|secret|AUTH_SECRET|PRIVATE_KEY)\s*[:=]\s*["']?)[^"'\s,\}]+/gi,
    replacement: "$1***REDACTED***",
  },
  {
    pattern: /"(password|passwordHash|apiKey)"\s*:\s*"[^"]*"/g,
    replacement: '"$1":"***REDACTED***"',
  },
  // File paths with usernames
  {
    pattern: /\/Users\/[a-zA-Z0-9._-]+\//g,
    replacement: "/Users/***REDACTED***/",
  },
  {
    pattern: /\/home\/[a-zA-Z0-9._-]+\//g,
    replacement: "/home/***REDACTED***/",
  },
  {
    pattern: /\\Users\\[a-zA-Z0-9._-]+\\/g,
    replacement: "\\Users\\***REDACTED***\\",
  },
];

export function sanitizeText(text: string): string {
  let result = text;
  for (const pattern of SANITIZE_PATTERNS) {
    result = result.replace(pattern, "");
  }
  return result.trim();
}

export function redactSensitiveInfo(text: string): string {
  let result = text;
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
