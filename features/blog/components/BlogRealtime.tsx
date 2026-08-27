"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/shared/api/supabase";

export default function BlogRealtime() {
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("website-blog-posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_posts" },
        () => router.refresh(),
      );

    void channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
