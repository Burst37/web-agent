"use client";

import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";

interface ConversationEntry {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
}

function formatRelativeTime(epoch: number): string {
  const diff = Date.now() / 1000 - epoch;
  const minutes = Math.floor(diff / 60);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(epoch * 1000).toLocaleDateString();
}

export default function HistoryPanel({
  onSelect,
  currentId,
}: {
  onSelect: (id: string, title: string) => void;
  currentId?: string;
}) {
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [show, setShow] = useState(false);

  const refresh = () => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then(setConversations)
      .catch(() => setConversations([]));
  };

  useEffect(() => {
    refresh();
  }, []);

  if (conversations.length === 0) return null;

  return (
    <div className="mt-16">
      <button
        type="button"
        className="text-body-small text-black-alpha-32 hover:text-black-alpha-48 transition-colors"
        onClick={() => setShow(!show)}
      >
        {show ? "Hide history" : "Recent"} ({conversations.length})
      </button>

      {show && (
        <div className="mt-8 flex flex-col gap-2 max-h-300 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              className={cn(
                "w-full text-left px-12 py-8 rounded-8 transition-all group",
                currentId === conv.id
                  ? "bg-heat-4 border border-heat-20"
                  : "hover:bg-black-alpha-2 border border-transparent",
              )}
              onClick={() => onSelect(conv.id, conv.title)}
            >
              <div className="text-body-medium text-accent-black truncate group-hover:text-heat-100 transition-colors">
                {conv.title}
              </div>
              <div className="text-body-small text-black-alpha-32">
                {formatRelativeTime(conv.updated_at)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
