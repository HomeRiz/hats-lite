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
