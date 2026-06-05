"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InfoIcon, LightbulbIcon, SparklesIcon } from "lucide-react";
import { useSubmitContextAnswersMutation } from "@/hooks/use-analysis";
import { ContextQuestion, SubmitContextAnswersRequest } from "@/types/api";
import { useFeedback } from "@/lib/use-feedback";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSection } from "@/components/loading-section";
import { motion } from "framer-motion";

interface ContextEvaluatorFormProps {
  publicId: string;
  questions: ContextQuestion[];
  onSuccess?: () => void;
}

export function ContextEvaluatorForm({ publicId, questions, onSuccess }: ContextEvaluatorFormProps) {
  const mutation = useSubmitContextAnswersMutation();
  const feedback = useFeedback();

  // Create dynamic schema based on questions
  const formSchema = React.useMemo(() => {
    const schemaObj: Record<string, z.ZodTypeAny> = {};
    questions.forEach((q) => {
      schemaObj[q.question_id] = z.string().optional();
    });
    return z.object(schemaObj);
  }, [questions]);

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData, isSkipped: boolean = false) => {
    const answers = questions.map((q) => ({
      question_id: q.question_id,
      answer: ((data as any)[q.question_id] as string) || "",
    })).filter((a) => a.answer.trim() !== "");

    const payload: SubmitContextAnswersRequest = {
      answers,
      is_skipped: isSkipped,
    };

    mutation.mutate(
      { publicId, payload },
      {
        onSuccess: () => {
          feedback.success("Jawaban terkirim", "Melanjutkan proses analisis...");
          if (onSuccess) {
            onSuccess();
          }
        },
        onError: (error) => {
          feedback.error("Gagal mengirim jawaban", error);
        },
      }
    );
  };

  return (
    <Card className="border-border/60 shadow-lg shadow-primary/5 bg-gradient-to-b from-card to-background overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-8 border-b">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <LightbulbIcon className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              Klarifikasi Informasi Analisis
              <SparklesIcon className="size-4 text-primary animate-pulse" />
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-0.5">
              AI membutuhkan beberapa informasi tambahan dari Anda untuk mengoptimalkan keakuratan analisis bisnis.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-8">
        <form id="context-form" onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-8 bg-background/30 p-6 md:p-8 rounded-xl border border-border/50 shadow-inner relative z-10">
          {questions.map((q, index) => (
            <motion.div 
              key={q.question_id} 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="space-y-3 pb-6 border-b border-border/40 last:border-b-0 last:pb-0"
            >
              <div>
                <label className="text-sm font-semibold text-foreground flex items-start gap-2.5 leading-relaxed">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <span className="pt-0.5">{q.question_text}</span>
                </label>
                <div className="mt-2.5 ml-8.5 flex items-start gap-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/5 px-3 py-2 text-xs text-blue-700 dark:text-blue-400 border border-blue-500/20 max-w-3xl">
                  <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
                  <p className="leading-relaxed"><strong>Alasan:</strong> {q.reason_why_needed}</p>
                </div>
              </div>
              <div className="ml-8.5">
                <Textarea
                  {...register(q.question_id)}
                  disabled={mutation.isPending}
                  placeholder="Ketik jawaban atau data pendukung Anda di sini..."
                  className="min-h-[100px] resize-y bg-background border-border/80 focus-visible:ring-primary/30 text-sm leading-relaxed"
                />
                {errors[q.question_id] && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors[q.question_id]?.message as string}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 pb-6 px-6 border-t border-border/30 bg-muted/20">
        <Button 
          type="button" 
          variant="ghost" 
          disabled={mutation.isPending}
          onClick={() => handleSubmit((data) => onSubmit(data, true))()}
          className="w-full sm:w-auto font-medium hover:bg-muted"
        >
          Lewati & Lanjutkan Analisis
        </Button>
        <Button 
          type="submit" 
          form="context-form" 
          disabled={mutation.isPending}
          className="w-full sm:w-auto font-semibold px-6 shadow-md hover:shadow-lg transition-shadow"
        >
          {mutation.isPending ? <LoadingSection.Button label="Mengirim..." /> : "Kirim Jawaban & Lanjutkan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
