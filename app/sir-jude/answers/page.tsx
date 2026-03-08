"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckSquare, Square, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import questionData from "@/assets/question.json";

type SirJudeQuestion = {
  questionText: string;
  image_file_name: string | null;
  answers: {
    rawText: string;
    correctAnswer: boolean;
  }[];
};

const QUESTIONS = questionData as SirJudeQuestion[];

export default function SirJudeAnswersPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Sir Jude&apos;s Reviewer
            </h1>
            <p className="text-muted-foreground">Answer Key</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/sir-jude">Back to Start</Link>
          </Button>
        </div>

        <Separator />

        <div className="space-y-6">
          {QUESTIONS.map((q, idx) => {
            const hasMultipleCorrect =
              q.answers.filter((a) => a.correctAnswer).length > 1;

            return (
              <Card key={idx} className="border-border/70 bg-card/90">
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-primary text-primary"
                    >
                      Q{idx + 1}
                    </Badge>
                    <Badge variant="secondary">
                      {hasMultipleCorrect
                        ? "Multiple Answers"
                        : "Single Answer"}
                    </Badge>
                  </div>

                  <div
                    className="text-base leading-relaxed md:text-lg prose prose-invert max-w-none [&>p]:m-0"
                    dangerouslySetInnerHTML={{ __html: q.questionText }}
                  />

                  {q.image_file_name && (
                    <div className="mt-4 flex justify-start bg-white/5 p-4 rounded-lg border border-border/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/assets/${q.image_file_name}`}
                        alt="Question visual"
                        className="max-w-full h-auto max-h-64 object-contain rounded"
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {q.answers.map((ans, i) => {
                    const isCorrect = ans.correctAnswer;
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
                          {hasMultipleCorrect ? (
                            isCorrect ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5 opacity-50" />
                            )
                          ) : isCorrect ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5 opacity-50" />
                          )}
                        </div>
                        <div
                          className="flex-1 leading-relaxed prose prose-sm prose-invert max-w-none [&>p]:m-0"
                          dangerouslySetInnerHTML={{ __html: ans.rawText }}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
