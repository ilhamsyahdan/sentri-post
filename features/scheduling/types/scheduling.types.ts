export type SchedulingSlot = {
  id: string;
  connection_id: string;
  day_of_week: number;
  time_slot: string;
  timezone: string;
  is_active: boolean;
  connections?: {
    platform: string;
  };
};

export type Candidate = {
  scheduledAt: Date;
  timezone: string;
  day_of_week: number;
  time_slot: string;
  platform: string;
};
