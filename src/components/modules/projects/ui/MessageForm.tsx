import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface MessageFormProps {
  projectId: string;
}

const formSchema = z.object({
  value: z.string()
    .min(1, { message: "Value is required" })
    .max(10000, { message: "Value is too long" })
});

export const MessageForm = ({ projectId }: MessageFormProps) => {

  const [isFocused, setIsFocused] = useState(false);
  const showUsage = false;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess: (data) => {
      form.reset();
      queryClient.invalidateQueries( // Refresh messages list to show new message + AI response
        trpc.messages.getMany.queryOptions({ projectId })
      );
      // TODO: invalidate usage status
    },
    onError: (error) => {
      toast.error(error.message);
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

  const isPending = createMessage.isPending; // Is message being sent?
  const isButtonDisabled = isPending || !form.formState.isValid; // Disable if sending or invalid

  return (
    <Form {...form}>
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
              disabled={isPending}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className='pt-4 resize-none border-none w-full outline-none bg-transparent'
              placeholder='What would you like to build?'
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
};

