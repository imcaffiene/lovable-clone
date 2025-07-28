import { useTRPC } from '@/trpc/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { MessageCard } from './MessageCard';
import { MessageForm } from './MessageForm';
import { useEffect, useRef } from 'react';
import { Fragment } from '@/generated/prisma';
import { MessageLoading } from './MessageLoading';

interface MessageContainerProps {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;
};


export const MessagesContainer = ({ projectId, activeFragment, setActiveFragment }: MessageContainerProps) => {

  const bottomRef = useRef<HTMLDivElement>(null); //to automatically scroll to bottom when new messages arrive

  const trpc = useTRPC();

  // Fetch all messages for this project
  const { data: messages } = useSuspenseQuery(trpc.messages.getMany.queryOptions({
    projectId
  }, {
    //todo -> temp live message update
    refetchInterval: 5000
  }));

  //Auto-Select Latest AI Fragment 
  // cause proble fix this
  // useEffect(() => {
  //   const lastAssistantMessageWithFragment = messages.findLast(
  //     (message) => message.role === 'ASSISTANT' && !!message.fragment
  //   );

  //   if (lastAssistantMessageWithFragment) {
  //     setActiveFragment(lastAssistantMessageWithFragment.fragment);
  //   }
  // }, [messages, setActiveFragment]);

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
              onFragmentClick={() => { setActiveFragment(message.fragment); }}
              type={message.type}
            />
          ))}

          {isLastMessage &&
            <MessageLoading

            />
          }

          <div ref={bottomRef} />
        </div>
      </div>

      <div className='relative p-3 pt-1'>

        <div className='absolute top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background pointer-events-none' />

        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
}

