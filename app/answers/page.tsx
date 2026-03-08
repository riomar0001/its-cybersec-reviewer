"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// To avoid excessive copy-pasting, we can import `QUESTIONS` if it were exported.
// Let's modify app/page.tsx to export `QUESTIONS`.
import { QUESTIONS } from "@/app/page";

export default function AnswersPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Main Reviewer</h1>
            <p className="text-muted-foreground">Answer Key</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Back to Start</Link>
          </Button>
        </div>

        <Separator />

        <div className="space-y-6">
          {QUESTIONS.map((q, idx) => (
            <Card key={q.id} className="border-border/70 bg-card/90">
              <CardHeader className="space-y-2 pb-4">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-primary text-primary"
                  >
                    Q{idx + 1}
                  </Badge>
                  <Badge variant="secondary">{q.category}</Badge>
                </div>
                <CardTitle className="text-base leading-relaxed md:text-lg">
                  {q.question.replace("[MATCH] ", "")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.answer;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
                        isCorrect
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                          : "border-border/50 bg-card/40 text-muted-foreground",
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5 opacity-50" />
                        )}
                      </div>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
