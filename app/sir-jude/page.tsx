"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Square, Circle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import questionData from "@/assets/question.json";

type SirJudeQuestion = {
  questionText: string;
  image_file_name: string | null;
  answers: {
    rawText: string;
    correctAnswer: boolean;
  }[];
};

type AnswerRecord = {
  questionIndex: number;
  selectedIndices: number[];
  correctIndices: number[];
  isCorrect: boolean;
};

type StartScreenProps = {
  onStart: () => void;
};

type QuizScreenProps = {
  questions: SirJudeQuestion[];
  onFinish: (answers: AnswerRecord[], elapsed: number) => void;
};

type ResultScreenProps = {
  questions: SirJudeQuestion[];
  answers: AnswerRecord[];
  elapsed: number;
  onRestart: () => void;
};

const QUESTIONS = questionData as SirJudeQuestion[];
const TOTAL = 100;
const LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(): SirJudeQuestion[] {
  return shuffle(QUESTIONS).slice(0, TOTAL);
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

// ─── START ───────────────────────────────────────────────────────────────────
function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-xl">
        <Card className="border-border/70 bg-card/80 shadow-sm backdrop-blur">
          <CardHeader className="items-center text-center">
            <div className="mb-2 inline-flex size-12 items-center justify-center rounded-2xl border bg-muted text-xl">
              🛡️
            </div>
            <CardTitle className="text-2xl tracking-tight">
              Sir Jude&apos;s Version Reviewer
            </CardTitle>
            <CardDescription className="text-xs uppercase tracking-[0.2em]">
              Select ALL correct answers
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: "📋", val: "100", sub: "Questions" },
                { icon: "🔀", val: "Random", sub: "Every run" },
                { icon: "⏱", val: "Timed", sub: "Live clock" },
              ].map((s) => (
                <Card
                  key={s.sub}
                  size="sm"
                  className="items-center border-border/60 bg-muted/30 py-2 text-center"
                >
                  <CardContent className="space-y-1 px-2">
                    <div className="text-base">{s.icon}</div>
                    <p className="text-xs font-semibold text-foreground">
                      {s.val}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={onStart}
              size="lg"
              className="w-full text-sm tracking-wide"
            >
              Begin Quiz
            </Button>

            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link href="/">Back to Main Reviewer</Link>
            </Button>

            <Button variant="secondary" size="lg" className="w-full" asChild>
              <Link href="/sir-jude/answers">View Answer Key</Link>
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-2">
              {TOTAL} questions drawn from {QUESTIONS.length} items
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── QUIZ ────────────────────────────────────────────────────────────────────
function QuizScreen({ questions, onFinish }: QuizScreenProps) {
  const [current, setCurrent] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const q = questions[current];
  const progress = (current / TOTAL) * 100;
  const score = answers.filter((a) => a.isCorrect).length;

  const confirm = () => {
    if (selectedIndices.length === 0) return;
    setConfirmed(true);
    const correctIndices = q.answers.reduce(
      (acc, ans, i) => (ans.correctAnswer ? [...acc, i] : acc),
      [] as number[],
    );

    // Check if exactly the correct ones are selected
    const isCorrect =
      correctIndices.length === selectedIndices.length &&
      correctIndices.every((c) => selectedIndices.includes(c));

    setAnswers((p) => [
      ...p,
      { questionIndex: current, selectedIndices, correctIndices, isCorrect },
    ]);
  };

  const next = () => {
    if (current + 1 >= TOTAL) {
      onFinish(answers, elapsed);
      return;
    }
    setCurrent((c) => c + 1);
    setSelectedIndices([]);
    setConfirmed(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-3 px-4">
          <span className="font-mono text-xs text-muted-foreground">
            {formatTime(elapsed)}
          </span>
          <div className="flex flex-1 items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {current + 1}
            </span>
            <Progress value={progress} className="h-1.5" />
            <span className="font-mono text-xs text-muted-foreground">
              {TOTAL}
            </span>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {score}/{current}
          </Badge>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl justify-center px-4 py-6 md:py-8">
        <Card className="w-full border-border/70 bg-card/90">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary text-primary">
                Question {current + 1}
              </Badge>
              <Badge variant="secondary">
                {q.answers.filter((a) => a.correctAnswer).length > 1
                  ? "Select ALL that apply"
                  : "Select ONE answer"}
              </Badge>
            </div>

            <div
              className="text-base leading-relaxed md:text-lg prose prose-invert max-w-none [&>p]:m-0"
              dangerouslySetInnerHTML={{ __html: q.questionText }}
            />

            {q.image_file_name && (
              <div className="mt-4 flex justify-center bg-white/5 p-4 rounded-lg border border-border/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/assets/${q.image_file_name}`}
                  alt="Question visual"
                  className="max-w-full h-auto max-h-96 object-contain rounded"
                />
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-3">
            {q.answers.map((ans, i) => {
              const isSelected = selectedIndices.includes(i);
              const isCorrect = ans.correctAnswer;
              const hasMultipleCorrect =
                q.answers.filter((a) => a.correctAnswer).length > 1;

              let btnClass =
                "border-border bg-card text-foreground hover:bg-muted";
              if (!confirmed) {
                if (isSelected)
                  btnClass =
                    "border-primary bg-primary/20 text-primary ring-2 ring-primary/40";
              } else {
                if (isCorrect)
                  btnClass =
                    "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
                else if (isSelected && !isCorrect)
                  btnClass =
                    "border-destructive/50 bg-destructive/10 text-destructive";
                else
                  btnClass =
                    "border-border/70 bg-card/40 text-muted-foreground";
              }

              return (
                <Button
                  key={i}
                  variant="outline"
                  className={cn(
                    "h-auto w-full justify-start gap-3 px-4 py-3 text-left whitespace-normal items-start group",
                    btnClass,
                  )}
                  onClick={() => {
                    if (confirmed) return;
                    if (hasMultipleCorrect) {
                      if (isSelected) {
                        setSelectedIndices((prev) =>
                          prev.filter((x) => x !== i),
                        );
                      } else {
                        setSelectedIndices((prev) => [...prev, i]);
                      }
                    } else {
                      setSelectedIndices([i]); // Radio behavior
                    }
                  }}
                >
                  <div className="mt-0.5 shrink-0">
                    {hasMultipleCorrect ? (
                      isSelected ? (
                        <CheckSquare
                          className={cn(
                            "w-5 h-5",
                            confirmed && isCorrect
                              ? "text-emerald-600 dark:text-emerald-400"
                              : confirmed && !isCorrect
                                ? "text-destructive"
                                : "text-primary",
                          )}
                        />
                      ) : (
                        <Square className="w-5 h-5 text-muted-foreground group-hover:text-foreground/70" />
                      )
                    ) : isSelected ? (
                      <CheckCircle2
                        className={cn(
                          "w-5 h-5",
                          confirmed && isCorrect
                            ? "text-emerald-600 dark:text-emerald-400"
                            : confirmed && !isCorrect
                              ? "text-destructive"
                              : "text-primary",
                        )}
                      />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground group-hover:text-foreground/70" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold mt-0.5",
                      isSelected && !confirmed
                        ? "border-primary/70 bg-primary/25 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {LABELS[i]}
                  </span>

                  <div
                    className="flex-1 text-sm leading-relaxed prose prose-sm prose-invert max-w-none [&>p]:m-0"
                    dangerouslySetInnerHTML={{ __html: ans.rawText }}
                  />

                  {confirmed && isCorrect && (
                    <span className="text-sm font-semibold shrink-0">OK</span>
                  )}
                  {confirmed && isSelected && !isCorrect && (
                    <span className="text-sm font-semibold shrink-0">X</span>
                  )}
                </Button>
              );
            })}

            {confirmed && (
              <Card
                size="sm"
                className={cn(
                  "border px-1 mt-4",
                  answers[answers.length - 1].isCorrect
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-destructive/40 bg-destructive/10",
                )}
              >
                <CardContent className="text-sm py-3">
                  {answers[answers.length - 1].isCorrect
                    ? "Correct! You selected all the right answers."
                    : "Incorrect. You missed some correct answers or selected incorrect ones."}
                </CardContent>
              </Card>
            )}

            <Separator className="my-4" />

            {!confirmed ? (
              <Button
                onClick={confirm}
                disabled={selectedIndices.length === 0}
                size="lg"
                className="w-full"
              >
                Confirm
              </Button>
            ) : (
              <Button onClick={next} size="lg" className="w-full">
                {current + 1 >= TOTAL ? "See Results" : "Next Question"}
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

// ─── RESULTS ─────────────────────────────────────────────────────────────────
function ResultScreen({
  questions,
  answers,
  elapsed,
  onRestart,
}: ResultScreenProps) {
  const [tab, setTab] = useState<"overview" | "review">("overview");

  const score = answers.filter((a) => a.isCorrect).length;
  const pct = Math.round((score / TOTAL) * 100);

  const grade =
    pct >= 90
      ? { label: "Excellent", tone: "text-emerald-600 dark:text-emerald-400" }
      : pct >= 80
        ? { label: "Great", tone: "text-primary" }
        : pct >= 70
          ? { label: "Good", tone: "text-amber-600 dark:text-amber-400" }
          : pct >= 60
            ? { label: "Passing", tone: "text-orange-600 dark:text-orange-400" }
            : { label: "Needs Work", tone: "text-destructive" };

  const wrongAnswers = answers.filter((a) => !a.isCorrect);

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <Card className="border-border/70 bg-card/90 text-center">
          <CardHeader className="space-y-2">
            <CardDescription className="text-[10px] uppercase tracking-[0.2em]">
              Results
            </CardDescription>
            <CardTitle className={cn("text-5xl tracking-tighter", grade.tone)}>
              {pct}%
            </CardTitle>
            <p className={cn("text-sm font-medium", grade.tone)}>
              {grade.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {score} of {TOTAL} correct · {formatTime(elapsed)}
            </p>
          </CardHeader>
        </Card>

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as "overview" | "review")}
          className="w-full"
        >
          <TabsList className="grid h-9 w-full grid-cols-2">
            <TabsTrigger value="overview">Summary</TabsTrigger>
            <TabsTrigger value="review">Wrong Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-3 space-y-4">
            <Card className="border-border/70 bg-card/70 py-6 text-center">
              <CardContent className="space-y-2 py-4">
                <p className="text-sm text-foreground">
                  You correctly answered{" "}
                  <span className="font-bold">{score}</span> out of{" "}
                  <span className="font-bold">{TOTAL}</span> questions.
                </p>
                <p className="text-xs text-muted-foreground">
                  Note: A question is only counted as correct if ALL correct
                  options and NO incorrect options are selected.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="mt-3 space-y-2">
            {wrongAnswers.length === 0 ? (
              <Card className="border-border/70 bg-card/70 py-6 text-center">
                <CardContent className="text-sm text-muted-foreground py-4">
                  Perfect score. No wrong answers.
                </CardContent>
              </Card>
            ) : (
              wrongAnswers.map((a, idx) => {
                const q = questions[a.questionIndex];
                return (
                  <Card
                    key={idx}
                    size="sm"
                    className="border-border/70 bg-card/70"
                  >
                    <CardContent className="space-y-3 py-4">
                      <div
                        className="text-sm leading-relaxed text-foreground/90 prose prose-sm prose-invert max-w-none [&>p]:m-0"
                        dangerouslySetInnerHTML={{ __html: q.questionText }}
                      />

                      {q.image_file_name && (
                        <div className="mt-2 flex justify-start">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/assets/${q.image_file_name}`}
                            alt="Question visual"
                            className="max-w-full h-auto max-h-40 object-contain rounded border border-border/50"
                          />
                        </div>
                      )}

                      <Separator className="my-2" />

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Correct Answers:
                        </p>
                        <ul className="space-y-1">
                          {a.correctIndices.map((ci) => (
                            <li
                              key={ci}
                              className="text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2"
                            >
                              <CheckSquare className="w-4 h-4 shrink-0 mt-0.5" />
                              <div
                                className="prose prose-sm prose-invert max-w-none [&>p]:m-0 inline"
                                dangerouslySetInnerHTML={{
                                  __html: q.answers[ci].rawText,
                                }}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2 mt-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Your Selection:
                        </p>
                        {a.selectedIndices.length > 0 ? (
                          <ul className="space-y-1">
                            {a.selectedIndices.map((si) => (
                              <li
                                key={si}
                                className={cn(
                                  "text-xs flex items-start gap-2",
                                  a.correctIndices.includes(si)
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-destructive",
                                )}
                              >
                                <Square className="w-4 h-4 shrink-0 mt-0.5" />
                                <div
                                  className="prose prose-sm prose-invert max-w-none [&>p]:m-0 inline"
                                  dangerouslySetInnerHTML={{
                                    __html: q.answers[si].rawText,
                                  }}
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            None
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        <Button
          onClick={onRestart}
          variant="default"
          size="lg"
          className="w-full mt-4"
        >
          Retake Quiz
        </Button>
        <Button variant="outline" size="lg" className="w-full mt-2" asChild>
          <Link href="/">Back to Main Reviewer</Link>
        </Button>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<"start" | "quiz" | "result">("start");
  const [questions, setQuestions] = useState<SirJudeQuestion[]>([]);
  const [finalAnswers, setFinalAnswers] = useState<AnswerRecord[]>([]);
  const [finalElapsed, setFinalElapsed] = useState(0);

  const handleStart = useCallback(() => {
    setQuestions(pickQuestions());
    setScreen("quiz");
  }, []);

  const handleFinish = useCallback((ans: AnswerRecord[], elapsed: number) => {
    setFinalAnswers(ans);
    setFinalElapsed(elapsed);
    setScreen("result");
  }, []);

  const handleRestart = useCallback(() => setScreen("start"), []);

  if (screen === "start") return <StartScreen onStart={handleStart} />;
  if (screen === "quiz")
    return <QuizScreen questions={questions} onFinish={handleFinish} />;
  return (
    <ResultScreen
      questions={questions}
      answers={finalAnswers}
      elapsed={finalElapsed}
      onRestart={handleRestart}
    />
  );
}
