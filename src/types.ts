import { z } from 'zod';

export const SessionStatusSchema = z.enum(['open', 'resolved', 'abandoned']);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionRowSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  error_message: z.string().nullable(),
  error_type: z.string().nullable(),
  stack_trace: z.string().nullable(),
  environment: z.string().nullable(),
  language: z.string().nullable(),
  framework: z.string().nullable(),
  tags: z.string(),
  status: SessionStatusSchema,
  created_at: z.number().int(),
  updated_at: z.number().int()
});

export const FixRowSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  description: z.string(),
  code_snippet: z.string().nullable(),
  worked: z.number().int().min(0).max(1),
  notes: z.string().nullable(),
  created_at: z.number().int()
});

export const CommandRowSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  command: z.string(),
  output: z.string().nullable(),
  exit_code: z.number().int().nullable(),
  ran_at: z.number().int()
});

export const CreateSessionSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(200)
    .describe('Short description of the bug/problem'),
  description: z.string().optional().describe('Detailed description'),
  error_message: z.string().optional().describe('The exact error message'),
  error_type: z
    .string()
    .optional()
    .describe('Error class/type (e.g. TypeError, 404, ENOENT)'),
  stack_trace: z.string().optional().describe('Stack trace if available'),
  environment: z.string().optional().describe('OS, Docker, Node version etc.'),
  language: z
    .string()
    .optional()
    .describe('Programming language (typescript, python, go...)'),
  framework: z
    .string()
    .optional()
    .describe('Framework (express, nextjs, django...)'),
  tags: z.array(z.string()).default([]).describe('Tags for categorization')
});

export const AddFixSchema = z.object({
  session_id: z.string().describe('Session ID to add fix to'),
  description: z.string().min(1).describe('What the fix does'),
  code_snippet: z.string().optional().describe('Code that fixed the problem'),
  worked: z.boolean().default(false).describe('Did this fix work?'),
  notes: z.string().optional().describe('Additional notes')
});

export const SearchSchema = z.object({
  query: z
    .string()
    .min(1)
    .describe('Search query — error message, keyword, or description'),
  language: z.string().optional().describe('Filter by programming language'),
  framework: z.string().optional().describe('Filter by framework'),
  status: SessionStatusSchema.optional().describe('Filter by status'),
  limit: z.number().int().min(1).max(50).default(10)
});

export const FindSimilarErrorsSchema = z.object({
  error_message: z.string().describe('The error message to search for'),
  limit: z.number().int().min(1).max(20).default(5)
});

export const RecordCommandSchema = z.object({
  session_id: z.string().describe('Session ID'),
  command: z.string().min(1).describe('Command that was run'),
  output: z.string().optional().describe('Command output'),
  exit_code: z.number().int().optional().describe('Exit code (0 = success)')
});

export const CloseSessionSchema = z.object({
  session_id: z.string().describe('Session ID to close'),
  status: z.enum(['resolved', 'abandoned']).describe('Final status'),
  summary: z.string().optional().describe('Summary of what fixed it')
});

export const GetSessionSchema = z.object({
  session_id: z.string().describe('Session ID')
});

export const UpdateSessionSchema = z
  .object({
    session_id: z.string().describe('Session ID to update'),
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.tags !== undefined,
    {
      message: 'At least one of title, description or tags must be provided'
    }
  );

export const DeleteSessionSchema = z.object({
  session_id: z.string().describe('Session ID to permanently delete'),
  confirm: z.boolean().describe('Must be true to confirm deletion')
});

export const ListSessionsSchema = z.object({
  status: SessionStatusSchema.optional(),
  language: z.string().optional(),
  framework: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
});

export const ExportSessionsSchema = z.object({
  format: z.enum(['json', 'summary']).default('json').describe('Export format')
});

export const ExportPayloadSchema = z.object({
  exported_at: z.string().optional(),
  schema_version: z.number().int().min(1),
  sessions: z.array(SessionRowSchema),
  fixes: z.array(FixRowSchema),
  commands: z.array(CommandRowSchema)
});

export const ImportSessionsSchema = z.object({
  payload: ExportPayloadSchema.describe(
    'Export JSON previously produced by export_sessions'
  ),
  skip_existing: z
    .boolean()
    .default(true)
    .describe(
      'Skip records whose IDs already exist instead of failing the import'
    )
});

export const GetSessionContextSchema = z.object({
  session_id: z.string().describe('Session ID'),
  include_commands: z.boolean().default(true),
  include_fixes: z.boolean().default(true)
});

export const GetStatsSchema = z.object({});

export type SessionRow = z.infer<typeof SessionRowSchema>;
export type FixRow = z.infer<typeof FixRowSchema>;
export type CommandRow = z.infer<typeof CommandRowSchema>;
export type CreateSession = z.infer<typeof CreateSessionSchema>;
export type AddFix = z.infer<typeof AddFixSchema>;
export type Search = z.infer<typeof SearchSchema>;
export type FindSimilarErrors = z.infer<typeof FindSimilarErrorsSchema>;
export type RecordCommand = z.infer<typeof RecordCommandSchema>;
export type CloseSession = z.infer<typeof CloseSessionSchema>;
export type GetSession = z.infer<typeof GetSessionSchema>;
export type UpdateSession = z.infer<typeof UpdateSessionSchema>;
export type DeleteSession = z.infer<typeof DeleteSessionSchema>;
export type ListSessions = z.infer<typeof ListSessionsSchema>;
export type ExportSessions = z.infer<typeof ExportSessionsSchema>;
export type ExportPayload = z.infer<typeof ExportPayloadSchema>;
export type ImportSessions = z.infer<typeof ImportSessionsSchema>;
export type GetSessionContext = z.infer<typeof GetSessionContextSchema>;
export type GetStats = z.infer<typeof GetStatsSchema>;

export type Fix = Omit<FixRow, 'worked'> & { worked: boolean };
export type Command = CommandRow;
export type Session = Omit<SessionRow, 'tags'> & {
  tags: string[];
  fixes: Fix[];
  commands: Command[];
};

export type ImportCounts = {
  sessions: number;
  fixes: number;
  commands: number;
};

export type ImportResult = {
  schema_version: number;
  imported: ImportCounts;
  skipped: ImportCounts;
  invalid: ImportCounts;
  errors: string[];
};
