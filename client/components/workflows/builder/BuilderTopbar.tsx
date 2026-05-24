"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

type BuilderTopbarProps = {
  workflowName: string;
  setWorkflowName: (value: string) => void;
  canSave: boolean;
  onSave: () => void;
  isSaving?: boolean;
};

const BuilderTopbar = ({
  workflowName,
  setWorkflowName,
  canSave,
  onSave,
  isSaving,
}: BuilderTopbarProps) => {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Link
          href="/workflows"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card transition-all duration-200 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder="Untitled Workflow"
          className="min-w-70 border-none bg-transparent text-xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Right */}
      <button
        onClick={onSave}
        disabled={!canSave || isSaving}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card-foreground px-4 py-2 text-sm font-medium text-background transition-all duration-300 ease-out hover:scale-[1.03] hover:bg-white hover:shadow-lg hover:shadow-white/5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
      >
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save Workflow"}
      </button>
    </header>
  );
};

export default BuilderTopbar;
