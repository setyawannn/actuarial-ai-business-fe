"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InfoIcon, LightbulbIcon } from "lucide-react";
import { useSubmitContextAnswersMutation } from "@/hooks/use-analysis";
import { ContextQuestion, SubmitContextAnswersRequest } from "@/types/api";
import { useFeedback } from "@/lib/use-feedback";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoadingSection } from "@/components/loading-section";

interface ContextEvaluatorFormProps {
  publicId: string;
  questions: ContextQuestion[];
}

export function ContextEvaluatorForm({ publicId, questions }: ContextEvaluatorFormProps) {
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
        },
        onError: (error) => {
          feedback.error("Gagal mengirim jawaban", error);
        },
      }
    );
  };

  return (
    <Card className="border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader className="bg-primary/5 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-primary">
            <LightbulbIcon className="size-5" />
          </div>
          <CardTitle className="text-xl">Butuh Informasi Tambahan</CardTitle>
        </div>
        <CardDescription className="text-base text-muted-foreground">
          AI kami memerlukan beberapa konteks tambahan untuk menghasilkan analisis yang lebih akurat. Silakan jawab pertanyaan berikut atau lewati untuk melanjutkan dengan data seadanya.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="-mt-4">
        <form id="context-form" onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-6 bg-card p-6 rounded-xl border shadow-sm relative z-10">
          {questions.map((q, index) => (
            <div key={q.question_id} className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-foreground flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  {q.question_text}
                </label>
                <div className="mt-2 ml-7 flex items-start gap-2 rounded-md bg-blue-500/10 px-3 py-2 text-xs text-blue-700 dark:text-blue-400">
                  <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
                  <p><strong>Alasan:</strong> {q.reason_why_needed}</p>
                </div>
              </div>
              <div className="ml-7">
                <Textarea
                  {...register(q.question_id)}
                  disabled={mutation.isPending}
                  placeholder="Ketik jawaban Anda di sini..."
                  className="min-h-[100px] resize-y bg-background"
                />
                {errors[q.question_id] && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors[q.question_id]?.message as string}
                  </p>
                )}
              </div>
            </div>
          ))}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 pb-6">
        <Button 
          type="button" 
          variant="outline" 
          disabled={mutation.isPending}
          onClick={() => handleSubmit((data) => onSubmit(data, true))()}
          className="w-full sm:w-auto"
        >
          Lewati & Lanjutkan
        </Button>
        <Button 
          type="submit" 
          form="context-form" 
          disabled={mutation.isPending}
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? <LoadingSection.Button label="Mengirim..." /> : "Kirim Jawaban"}
        </Button>
      </CardFooter>
    </Card>
  );
}
