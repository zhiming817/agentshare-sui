// === Legacy types (for JSON/Markdown parsers and old data) ===

export interface ParsedMessage {
  sequence: number;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: Record<string, unknown>[];
  timestamp?: Date;
}

export interface ParsedConversation {
  messages: ParsedMessage[];
  title?: string;
}

export interface UploadSkill {
  name: string;
  description?: string;
  content: string;
}

export interface UploadEnvironment {
  os?: string;
  containerInfo?: string;
  gpu?: string;
  runtimeInfo?: string;
}

// === Claude Code JSONL Types (from claude-run reference) ===

export interface ContentBlock {
  type: "text" | "thinking" | "tool_use" | "tool_result";
  // text block
  text?: string;
  // thinking block
  thinking?: string;
  // tool_use fields
  id?: string;
  name?: string;
  input?: unknown;
  // tool_result fields
  tool_use_id?: string;
  content?: string | ContentBlock[];
  is_error?: boolean;
}

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export interface ConversationMessage {
  type: "user" | "assistant" | "summary" | "file-history-snapshot";
  uuid?: string;
  parentUuid?: string;
  timestamp?: string;
  sessionId?: string;
  message?: {
    role: string;
    content: string | ContentBlock[];
    model?: string;
    usage?: TokenUsage;
  };
  summary?: string;
}

export interface ParsedMessageV2 {
  sequence: number;
  type: "user" | "assistant";
  role: string;
  contentBlocks: ContentBlock[];
  contentText: string;
  timestamp?: Date;
  model?: string;
  usage?: TokenUsage;
}

export interface ParsedConversationV2 {
  messages: ParsedMessageV2[];
  title?: string;
  summary?: string;
}
