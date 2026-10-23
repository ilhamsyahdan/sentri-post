// lib/db/draft.ts

export interface DraftChannel {
  connectionId: string;
  text: string;
  mediaUrls: string[];
}

export interface SaveDraftPayload {
  draftId?: string;
  userId: string;
  channels: DraftChannel[];
}
