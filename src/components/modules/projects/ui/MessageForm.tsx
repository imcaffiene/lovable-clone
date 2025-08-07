import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef, memo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Usage } from './Usage';
import { useRouter } from 'next/navigation';

interface MessageFormProps {
  projectId: string;
}

const formSchema = z.object({
  value: z.string()
    .min(1, { message: "Value is required" })
    .max(10000, { message: "Value is too long" })
});

export const MessageForm = memo(({ projectId }: MessageFormProps) => {

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: usage } = useQuery(trpc.usage.status.queryOptions());

  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries( // Refresh messages list to show new message + AI response
        trpc.messages.getMany.queryOptions({ projectId })
      );
      queryClient.invalidateQueries(
        trpc.usage.status.queryOptions()
      );
    },
    onError: (error) => {
      toast.error(error.message);

      if (error.data?.code === "TOO_MANY_REQUESTS") {
        router.push("/pricing");
      }
    }
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: ""
    }
  });

  const onSubmit = async (value: z.infer<typeof formSchema>) => {
    await createMessage.mutateAsync({
      projectId,
      value: value.value
    });
  };

  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const showUsage = !!usage;

  const isPending = createMessage.isPending; // Is message being sent?
  const isButtonDisabled = isPending || !form.formState.isValid; // Disable if sending or invalid

  // Global keyboard shortcut to focus message input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key focuses the message input
      if (e.key === 'Escape' && textareaRef.current) {
        e.preventDefault();
        textareaRef.current.focus();
      }
      // Cmd/Ctrl + K also focuses the message input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Form {...form}>

      {showUsage && (
        <Usage
          points={usage.remainingPoints}
          msBeforeNext={usage.msBeforeNext}
        />
      )}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          isFocused && "shadow-xs",
          showUsage && "rounded-t-none"
        )}
      >
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <Textarea
              {...field}
              ref={textareaRef}
              disabled={isPending}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className='pt-4 resize-none border-none w-full outline-none bg-transparent'
              placeholder='What would you like to build? (Esc to focus, ⌘+Enter to send)'
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }
              }}
            />
          )}
        />

        {/* FORM FOOTER */}
        <div className='flex gap-x-2 items-end justify-between pt-2'>

          {/* KEYBOARD SHORTCUT HINT */}
          <div className='text-[10px] text-muted-foreground font-mono'>
            <kbd className='ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground'>
              <span>&#8984;</span>Enter
            </kbd>
            &nbsp;to submit
          </div>

          <Button
            disabled={isButtonDisabled}
            className={cn(
              "size-8 rounded-full",
              isButtonDisabled && "bg-muted-foreground border"
            )}
          >
            {isPending ? (
              <Loader2Icon className='animate-spin' />
            ) : (
              <ArrowUpIcon />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
});

MessageForm.displayName = 'MessageForm';

