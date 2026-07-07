"use client";

import { Wifi, WifiOff, Clock, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

/**
 * OfflineQueueStatus
 *
 * A non-intrusive status banner that reflects the offline message queue state.
 * Shows nothing when online with no pending messages.
 *
 * Props:
 *   status: { pendingCount, failedCount, isSyncing, isOnline }
 *   onRetry: () => void  — triggers a manual drain attempt
 */
export default function OfflineQueueStatus({ status, onRetry }) {
  const { pendingCount, failedCount, isSyncing, isOnline } = status || {};

  // Nothing to show — user is online and queue is empty
  if (isOnline && pendingCount === 0 && failedCount === 0 && !isSyncing) {
    return null;
  }

  // ─── Determine appearance based on state ────────────────────────────────
  let config;

  if (!isOnline) {
    config = {
      icon: <WifiOff className="w-4 h-4 shrink-0" />,
      bg: "from-slate-800/95 to-slate-900/95 border-slate-600/60",
      text: "text-slate-200",
      accent: "text-amber-400",
      label: "You're offline.",
      sub: pendingCount > 0
        ? `${pendingCount} message${pendingCount > 1 ? "s" : ""} will be sent automatically when you reconnect.`
        : "Messages will be queued until you reconnect.",
    };
  } else if (isSyncing) {
    config = {
      icon: <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />,
      bg: "from-indigo-950/95 to-slate-900/95 border-indigo-500/40",
      text: "text-slate-200",
      accent: "text-indigo-400",
      label: "Syncing messages…",
      sub: `Sending ${pendingCount} queued message${pendingCount !== 1 ? "s" : ""}.`,
    };
  } else if (failedCount > 0 && pendingCount === 0) {
    config = {
      icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
      bg: "from-red-950/95 to-slate-900/95 border-red-500/40",
      text: "text-slate-200",
      accent: "text-red-400",
      label: `${failedCount} message${failedCount > 1 ? "s" : ""} could not be delivered.`,
      sub: "These messages failed after multiple retries.",
      showRetry: true,
    };
  } else if (pendingCount > 0) {
    config = {
      icon: <Clock className="w-4 h-4 shrink-0" />,
      bg: "from-amber-950/95 to-slate-900/95 border-amber-500/40",
      text: "text-slate-200",
      accent: "text-amber-400",
      label: `${pendingCount} message${pendingCount > 1 ? "s" : ""} pending.`,
      sub: "Will send automatically when connection is stable.",
      showRetry: true,
    };
  } else {
    return null;
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-2.5 mx-3 mb-1
        rounded-xl border bg-gradient-to-r backdrop-blur-xl
        text-sm shadow-lg transition-all duration-300 animate-in slide-in-from-top-2
        ${config.bg}
      `}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <span className={config.accent}>{config.icon}</span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <span className={`font-semibold ${config.accent}`}>{config.label}</span>
        {config.sub && (
          <span className={`ml-1.5 ${config.text} opacity-70 text-xs`}>{config.sub}</span>
        )}
      </div>

      {/* Retry button */}
      {config.showRetry && onRetry && isOnline && (
        <button
          onClick={onRetry}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-all"
          aria-label="Retry sending queued messages"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  );
}
