export type Platform = AnalyticsPost["platform"];

export type PlatformConfig = {
  label: string;
  icon: string;
  color: string;
  iconBg: string;
  supportsAnalytics: boolean;

  metrics: {
    hasViews: boolean;
    hasSaved: boolean;
    hasShares: boolean;
  };

  gradient: {
    from: string;
    to: string;
  };
};

export type EngagementChartData = {
  id: string;
  date: string;
  dateLabel: string;
  time: string;
  postNumber: number;
  content: string;
  engagement: number;
  likes: number;
  comments: number;
  reach: number;
  saved: number;
};

export type ChartPayloadItem = {
  name: string;
  value: number;
  color: string;
  dataKey: string;
};

export type EngagementChartPayloadItem = ChartPayloadItem & {
  payload: EngagementChartData;
};

export type ChartTooltipProps = {
  active?: boolean;
  payload?: EngagementChartPayloadItem[];
  label?: string;
};

export type AnalyticsPost = {
  targetId: string;
  postId: string;
  platform: "instagram" | "linkedin";
  connectionName: string;
  content: string;
  scheduledAt: string;
  likes: number;
  comments: number;
  views: number;
  saved: number;
  shares: number;
  engagementRate: number;
  analyticsUpdatedAt: string | null;
};

export type Props = {
  initialPosts: AnalyticsPost[];
};
