import { Suspense } from "react";
import { ExperienceRoot } from "@/components/experience/ExperienceRoot";

export default function BauenPage() {
  return (
    <Suspense fallback={<div className="h-screen-safe w-full bg-cream-50" />}>
      <ExperienceRoot />
    </Suspense>
  );
}
