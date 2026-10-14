export type SectionKey = 'requirements' | 'objectives' | 'environment' | 'constraints' | 'rules'

export type Sections = Record<SectionKey, string[]>

export type Refined = { original: string; title: string; sections: Sections }

export type Workspace = { cwd: string; branch: string; ruleFiles: string[] }

// A /task-resolver:start held by the intake middleware until the user approves the refined requirement.
export type Intake = { command: string; args: string }

export type Status = { kind: 'idle' } | { kind: 'refining' } | { kind: 'error'; message: string }

declare module 'claude-code' {
  interface PluginState {
    'prompt-workspace': {
      refined: Refined | null
      status: Status
      workspace: Workspace
      isAuto: boolean
      intake: Intake | null
    }
  }
}
