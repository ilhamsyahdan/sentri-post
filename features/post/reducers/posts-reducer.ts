import { AccountPostState } from "../types";

export type PostsState = Record<string, AccountPostState>;

export type PostsAction =
  // User mengetik teks (mode normal, 1 channel)
  | { type: "SET_TEXT"; id: string; text: string }
  // User mengetik teks (mode sync, diterapkan ke beberapa channel platform yang sama)
  | { type: "SET_TEXT_SYNCED"; ids: string[]; text: string }
  // Channel baru dipilih -> buat entry kosong kalau belum ada
  | { type: "INIT_POST"; id: string }
  // Resume draft -> replace penuh 1 entry, TIDAK dianggap perubahan user
  | { type: "RESUME_DRAFT"; id: string; post: AccountPostState }
  // Mulai upload file -> preview lokal + status uploading
  | { type: "START_UPLOAD"; id: string; previewUrl: string; file: File }
  // Progress upload (tidak perlu dianggap dirty, cuma UI feedback)
  | { type: "SET_UPLOAD_PROGRESS"; id: string; progress: number }
  // Upload sukses, 1 channel
  | { type: "UPLOAD_SUCCESS"; id: string; patch: Partial<AccountPostState> }
  // Upload sukses, disebar ke channel lain yang sync platform-nya sama
  | {
      type: "UPLOAD_SUCCESS_SYNCED";
      sourceId: string;
      syncedIds: string[];
      patch: Partial<AccountPostState>;
    }
  // Upload gagal -> reset field terkait file
  | { type: "UPLOAD_FAILURE"; id: string }
  // Hapus file yang sudah ter-upload
  | { type: "REMOVE_FILE"; id: string }
  // Toggle sync ON -> copy state dari master channel ke channel lain di platform yang sama
  | { type: "APPLY_SYNC_FROM_MASTER"; masterId: string; targetIds: string[] }
  // Modal ditutup -> reset semua
  | { type: "RESET" };

export function postsReducer(
  state: PostsState,
  action: PostsAction
): PostsState {
  switch (action.type) {
    case "SET_TEXT":
      return {
        ...state,
        [action.id]: { ...state[action.id], text: action.text },
      };

    case "SET_TEXT_SYNCED": {
      const next = { ...state };
      action.ids.forEach((id) => {
        next[id] = { ...next[id], text: action.text };
      });
      return next;
    }

    case "INIT_POST":
      if (state[action.id]) return state; // sudah ada, tidak perlu overwrite
      return {
        ...state,
        [action.id]: { text: "", file: null, previewUrl: null },
      };

    case "RESUME_DRAFT":
      return { ...state, [action.id]: action.post };

    case "START_UPLOAD":
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          file: action.file,
          previewUrl: action.previewUrl,
          isUploading: true,
          uploadProgress: 0,
          cloudinaryUrl: null,
          publicId: null,
        },
      };

    case "SET_UPLOAD_PROGRESS":
      return {
        ...state,
        [action.id]: { ...state[action.id], uploadProgress: action.progress },
      };

    case "UPLOAD_SUCCESS":
      return {
        ...state,
        [action.id]: { ...state[action.id], ...action.patch },
      };

    case "UPLOAD_SUCCESS_SYNCED": {
      const next = {
        ...state,
        [action.sourceId]: { ...state[action.sourceId], ...action.patch },
      };
      action.syncedIds.forEach((id) => {
        if (id === action.sourceId) return;
        next[id] = { ...next[id], ...action.patch };
      });
      return next;
    }

    case "UPLOAD_FAILURE":
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          file: null,
          previewUrl: null,
          isUploading: false,
          uploadProgress: 0,
        },
      };

    case "REMOVE_FILE":
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          file: null,
          previewUrl: null,
          cloudinaryUrl: null,
          publicId: null,
          isUploading: false,
          uploadProgress: 0,
        },
      };

    case "APPLY_SYNC_FROM_MASTER": {
      const master = state[action.masterId];
      if (!master) return state;
      const next = { ...state };
      action.targetIds.forEach((id) => {
        next[id] = { ...master };
      });
      return next;
    }

    case "RESET":
      return {};

    default:
      return state;
  }
}
