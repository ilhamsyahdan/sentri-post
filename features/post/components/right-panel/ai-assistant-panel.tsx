import { memo, useCallback, useRef, useState } from "react";
import { AiMode, Channel } from "../../types";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildPrompt,
  PLATFORM_COLOR,
  QUICK_PROMPTS,
  TONE_OPTIONS,
} from "../../constants";

const AiAssistantPanel = memo(
  ({
    platform,
    currentText,
    onInsert,
    onReplace,
  }: {
    platform: Channel["platform"] | null;
    currentText: string;
    onInsert: (text: string) => void;
    onReplace: (text: string) => void;
  }) => {
    // mode tetap dipertahankan agar buildPrompt tidak berubah
    const [mode] = useState<AiMode>("generate");

    const [topic, setTopic] = useState("");
    const [tone, setTone] = useState("profesional");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const resultRef = useRef<HTMLDivElement>(null);

    const run = useCallback(async () => {
      setLoading(true);
      setError("");
      setResult("");

      try {
        const res = await fetch(`/api/ai`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: buildPrompt(mode, platform, tone, topic, currentText),
          }),
        });

        const data = await res.json();

        if (data.error) {
          throw new Error(data.error.message);
        }

        setResult(data.text);

        setTimeout(() => {
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }, 100);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Gagal menghubungi Gemini.";

        setError(`Error: ${message}`);
      } finally {
        setLoading(false);
      }
    }, [mode, platform, tone, topic, currentText]);

    const copy = useCallback(() => {
      navigator.clipboard.writeText(result);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    }, [result]);

    const isRunDisabled = loading || !topic.trim();

    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="px-4 pt-4 pb-3 border-b border-emerald-100 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Sparkles size={13} className="text-emerald-800" />
            </div>

            <p className="text-xs font-bold text-gray-800">AI Assistant</p>

            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md bg-blue-500">
              Gemini
            </span>

            {platform && (
              <span
                className={cn(
                  "text-[10px] font-bold text-white px-2 py-0.5 rounded-md",
                  PLATFORM_COLOR[platform]
                )}
              >
                {platform}
              </span>
            )}
          </div>

          <p className="text-[11px] text-gray-400">
            Bantu tulis & optimalkan konten kamu
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
          <div>
            <p className="text-[11px] font-bold text-gray-500 mb-2">Prompt</p>

            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Tulis prompt yang ingin dibuat AI..."
              rows={4}
              className="w-full text-xs text-gray-700 bg-emerald-50/30 border border-emerald-200 rounded-xl px-3 py-2.5 resize-none outline-none focus:border-emerald-800 focus:bg-white transition-all placeholder:text-gray-300 leading-relaxed"
            />
          </div>

          <button
            onClick={run}
            disabled={isRunDisabled}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-emerald-100 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={13} />
                Generate
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
              <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div
              ref={resultRef}
              className="bg-emerald-50/30 border border-emerald-200 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-emerald-100">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-800" />

                  <span className="text-[11px] font-bold text-emerald-950">
                    Hasil Gemini
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={run}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-800 hover:bg-emerald-100 transition-all"
                    title="Generate ulang"
                  >
                    <RefreshCw size={11} />
                  </button>

                  <button
                    onClick={copy}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-800 hover:bg-emerald-100 transition-all"
                    title="Copy"
                  >
                    {copied ? (
                      <Check size={11} className="text-emerald-800" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                </div>
              </div>

              <p className="px-3 py-3 text-[12px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {result}
              </p>

              <div className="flex gap-2 px-3 pb-3">
                <button
                  onClick={() => onInsert(result)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white border border-emerald-300 text-[11px] font-bold text-emerald-800 hover:border-emerald-800 hover:bg-emerald-50 transition-all"
                >
                  <ArrowRight size={11} />
                  Sisipkan
                </button>

                <button
                  onClick={() => onReplace(result)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-emerald-100 text-[11px] font-bold transition-all shadow-xs"
                >
                  <Check size={11} />
                  Gunakan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

AiAssistantPanel.displayName = "AiAssistantPanel";

export default AiAssistantPanel;
