'use client';

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
import { useRouter } from 'next/navigation';
import { PROJECT_TEMPLATES } from '@/lib/constants';
import { useClerk } from '@clerk/nextjs';



const formSchema = z.object({
  value: z.string()
    .min(1, { message: "Value is required" })
    .max(10000, { message: "Value is too long" })
});

export const ProjectForm = () => {

  const router = useRouter();
  const clerk = useClerk();
  const [isFocused, setIsFocused] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createProject = useMutation(trpc.projects.create.mutationOptions({
    onSuccess: (data) => {
      queryClient.invalidateQueries( // Refresh projects list to show new project
        trpc.projects.getMany.queryOptions()
      );

      queryClient.invalidateQueries( // Refresh usage status
        trpc.usage.status.queryOptions()
      );

      router.push(`/projects/${data.id}`);

    },
    onError: (error) => {
      toast.error(error.message);

      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }

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
    await createProject.mutateAsync({
      value: value.value
    });
  };

  const onSelect = (content: string) => {
    form.setValue("value", content, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const isPending = createProject.isPending; // Is project being created?
  const isButtonDisabled = isPending || !form.formState.isValid; // Disable if creating or invalid 

  return (
    <Form {...form}>
      <section className='space-y-6'>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
            isFocused && "shadow-xs",
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

        <div className='flex-wrap justify-center gap-2 hidden md:flex max-w-3xl'>
          {PROJECT_TEMPLATES.map((template) => (
            <Button
              key={template.title}
              variant={"outline"}
              size={"sm"}
              className="bg-white dark:bg-sidebar"
              onClick={() => onSelect(template.prompt)}
            >
              {template.emoji}{template.title}
            </Button>
          ))}
        </div>
      </section>
    </Form>
  );
};

