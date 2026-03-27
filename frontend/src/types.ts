export interface House {
  id: number;
  name: string;
  description: string;
  total_points: number;
}

export interface Log {
  id: number;
  points: number;
  reason: string;
  class_group?: string;
  awarded_at: string;
}
