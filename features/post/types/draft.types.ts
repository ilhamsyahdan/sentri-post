export interface DraftChannel {
  connectionId: string;
  platform?: string;
  text: string;
  mediaUrls?: string[];
  publicIds?: string[];
}

export interface SaveDraftPayload {
  userId: string;
  channels: DraftChannel[];
  draftIdMap?: Record<string, string>;
}

export interface DraftRecord {
  id: string;
  connectionId: string;
  platform: string;
  content: string;
  mediaUrls: string[];
  publicIds: string[];
  created_at: string;
  updated_at: string;
}
