export type Selection = {
  theme: string;
  dark?: boolean;
  primaryColor?: string;
  accentColor?: string;
};

export type ThemeEntry = {
  vars: Record<string, string>;
  modes?: {
    dark?: Record<string, string>;
    light?: Record<string, string>;
  };
};

export type TrialInfo = {
  user_id: string;
  previous: Selection;
  candidate: Selection;
  started_at: number;
  try_until: number;
  confirm_until: number;
};

export type EffectiveSource = "trial" | "opt_out" | "manual" | "birthday" | "holiday" | "schedule" | "none";

export type OwnSelection = Selection & { captured_at: number };

export type EffectiveResult = {
  selection: Selection | null;
  source: EffectiveSource;
  until: number | null;
  assigned_by_name?: string;
  override_id?: string;
  own: OwnSelection | null;
  opt_out: boolean;
};

export type EffectiveEvent = {
  type: "effective";
  selection: Selection | null;
  source: EffectiveSource;
  until: number | null;
  assigned_by_name?: string;
};
