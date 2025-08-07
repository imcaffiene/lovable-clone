import { Card } from '@/components/ui/card';
import { Fragment, MessageRole, MessageType } from '@/generated/prisma';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronRight, Code2Icon } from 'lucide-react';
import Image from 'next/image';
import { memo } from 'react';

interface UserMessageProps {
  content: string;
}

const UserMessage = memo(({ content }: UserMessageProps) => {
  return (
    <div className='flex justify-end pb-4 pr-2 pl-10'>
      <Card className='rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words'>
        {content}
      </Card>
    </div>
  );
});

UserMessage.displayName = 'UserMessage';

interface FragmentCardProps {
  fragment: Fragment;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
}

const FragmentCard = memo(({
  fragment,
  isActiveFragment,
  onFragmentClick
}: FragmentCardProps) => {
  return (
    <button
      className={cn(
        "flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isActiveFragment &&
        "bg-primary text-primary-foreground border-primary hover:bg-primary"
      )}
      onClick={() => onFragmentClick(fragment)}
      aria-label={`View ${fragment.title} fragment`}
      aria-pressed={isActiveFragment}
    >
      <Code2Icon className='size-4 mt-0.5' />

      <div className='flex flex-col flex-1'>
        <span className='text-sm font-medium line-clamp-1'>
          {fragment.title}
        </span>

        <span className='text-sm'>Preview</span>
      </div>

      <div className='flex items-center justify-center mt-0.5'>
        <ChevronRight className='size-4' />
      </div>
    </button>
  );
});

FragmentCard.displayName = 'FragmentCard';

interface AssistantMessageProps {
  content: string;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
}

const AssistantMessage = memo(({
  content,
  createdAt,
  fragment,
  isActiveFragment,
  onFragmentClick,
  type
}: AssistantMessageProps) => {
  return (
    <div className={cn(
      "flex flex-col group px-2 pb-4",
      type === "ERROR" && "text-red-700 dark:text-red-500",
    )}>
      <div className='flex items-center gap-2 pl-2 mb-2'>

        <Image
          src={"/logo.svg"}
          alt="Caffeine"
          width={18}
          height={18}
          className='shrink-0'
        />

        {/* <CaffeineLogo variant={'icon'} size={'sm'} animated={false} /> */}


        <span className='text-sm font-medium'>Caffiene</span>

        <span className='text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100'>
          {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
        </span>
      </div>

      <div className='pl-8.5 flex flex-col gap-y-4'>
        <span>{content}</span>

        {fragment && type === "RESULT" && (
          <FragmentCard
            fragment={fragment}
            isActiveFragment={isActiveFragment}
            onFragmentClick={onFragmentClick}
          />
        )}
      </div>
    </div>
  );
});

AssistantMessage.displayName = 'AssistantMessage';

interface MessageCardProps {
  content: string;
  role: MessageRole;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
  type: MessageType;
};

export const MessageCard = memo(({
  content,
  createdAt,
  fragment,
  isActiveFragment,
  onFragmentClick,
  role,
  type
}: MessageCardProps) => {

  if (role === 'ASSISTANT') {
    return (
      <AssistantMessage
        content={content}
        fragment={fragment}
        createdAt={createdAt}
        isActiveFragment={isActiveFragment}
        onFragmentClick={onFragmentClick}
        type={type}
      />
    );
  }

  return (
    <UserMessage content={content} />
  );

});

MessageCard.displayName = 'MessageCard';











/**
 MessageCard (Main wrapper)
├── AssistantMessage (AI responses)
│   ├── Logo + timestamp header
│   ├── Message content
│   └── FragmentCard (generated app preview)
└── UserMessage (User inputs - simple design)
 */
