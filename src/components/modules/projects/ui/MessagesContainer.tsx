import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { MessageCard } from "./MessageCard";
import { MessageForm } from "./MessageForm";
import { useEffect, useRef } from "react";
import { Fragment } from "@/generated/prisma";
import { MessageLoading } from "./MessageLoading";

interface MessageContainerProps {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;
}

export const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: MessageContainerProps) => {
  const bottomRef = useRef<HTMLDivElement>(null); //to automatically scroll to bottom when new messages arrive

  const lastAssistantMessageIdRef = useRef<string | null>(null);

  const trpc = useTRPC();

  // Check if usage should be shown
  const { data: usage } = useQuery(trpc.usage.status.queryOptions());
  const showUsage = !!usage;

  // Fetch all messages for this project
  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions(
      {
        projectId,
      },
      {
        // Smart polling: faster when expecting AI response, slower when idle
        refetchInterval: (query) => {
          const data = query.state.data;
          if (!data || !Array.isArray(data)) return 10000;
          const lastMessage = data[data.length - 1];
          const isWaitingForAI = lastMessage?.role === "USER";
          return isWaitingForAI ? 2000 : 10000; // 2s when waiting, 10s when idle
        },
        refetchIntervalInBackground: false, // Don't poll when tab is not active
      }
    )
  );

  //Auto-Select Latest AI Fragment
  useEffect(() => {
    const lastAssistantMessage = messages.findLast(
      (message) => message.role === "ASSISTANT"
    );

    if (
      lastAssistantMessage?.fragment &&
      lastAssistantMessage.id !== lastAssistantMessageIdRef.current
    ) {
      setActiveFragment(lastAssistantMessage.fragment);
      lastAssistantMessageIdRef.current = lastAssistantMessage.id;
    }
  }, [messages, setActiveFragment]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages.length]);

  // loading state
  const lastMessage = messages[messages.length - 1];
  const isLastMessage = lastMessage.role === "USER";

  return (
    <div className='flex flex-col flex-1 min-h-0'>
      <div className='flex-1 min-h-0 overflow-y-auto'>
        <div className='pt-2 pr-1'>
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              fragment={message.fragment}
              createdAt={message.createdAt}
              isActiveFragment={activeFragment?.id === message.fragment?.id}
              onFragmentClick={() => {
                setActiveFragment(message.fragment);
              }}
              type={message.type}
            />
          ))}

          {isLastMessage && <MessageLoading />}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className='relative p-3 pt-1'>
        <div
          className={`absolute left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none ${showUsage ? 'top-16' : 'top-6'
            }`}
        />

        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};
