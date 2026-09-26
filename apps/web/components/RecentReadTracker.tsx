"use client";

import { useEffect } from "react";
import { rememberRecentRead } from "./RecentReads";

export default function RecentReadTracker({ workId, title, collection }: { workId: string; title: string; collection: string }) {
  useEffect(() => {
    rememberRecentRead({ workId, title, collection });
  }, [workId, title, collection]);
  return null;
}
