import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import z from "zod";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";
import {
  useConversationActions,
  useConversationId,
} from "@/modules/widget/store/use-conversation-store";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useContactSessionId } from "../../store/use-contact-session-store";
import { useScreenActions } from "../../store/use-screen-store";
import {
  AIConversation,
  AIConversationContent,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";

import { AIResponse } from "@workspace/ui/components/ai/response";
import {
  AISuggestions,
  AISuggestion,
} from "@workspace/ui/components/ai/suggestion";
import { useAction, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { WIDGET_SCREENS } from "../../types";
import { Button } from "@workspace/ui/components/button";
import { Form, FormField } from "@workspace/ui/components/form";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const WidgetChatScreen = () => {
  const conversationId = useConversationId();
  const contactSessionId = useContactSessionId();
  const { setScreen } = useScreenActions();
  const { setConversationId } = useConversationActions();

  const conversation = useQuery(
    api.public.conversations.getOne,
    conversationId && contactSessionId
      ? {
          id: conversationId,
          contactSessionId,
        }
      : "skip",
  );
  const [isPendingCreateMessage, setIsPendingCreateMessage] = useState(false);

  const messages = useThreadMessages(
    api.public.messages.getMany,
    conversation?.threadId && contactSessionId
      ? {
          threadId: conversation.threadId,
          contactSessionId,
        }
      : "skip",
    { initialNumItems: 10 },
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const { topElementRef, hadleLoadMore, canLoadMore, isLoadingMore } =
    useInfiniteScroll({
      status: messages.status,
      loadMore: messages.loadMore,
      loadSize: 10,
    });

  const createMessage = useAction(api.public.messages.create);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!conversation || !contactSessionId) return;

    setIsPendingCreateMessage(true);

    form.reset();

    try {
      await createMessage({
        prompt: values.message,
        threadId: conversation.threadId,
        contactSessionId,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsPendingCreateMessage(false);
    }
  };

  const handleOnBack = () => {
    setConversationId(null);
    setScreen(WIDGET_SCREENS.SELECTION);
  };

  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button size="icon" variant="ghost" onClick={handleOnBack}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <p className="text-lg font-medium">Chat</p>
        </div>
        <Button size="icon" variant="ghost">
          <MenuIcon className="size-4" />
        </Button>
      </WidgetHeader>
      <AIConversation>
        <AIConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={hadleLoadMore}
            ref={topElementRef}
          />
          {toUIMessages(messages.results ?? [])?.map((message) => {
            return (
              <AIMessage
                from={message.role === "user" ? "user" : "assistant"}
                key={message.id}
              >
                <AIMessageContent>
                  <AIResponse>{message.content}</AIResponse>
                </AIMessageContent>
                {message.role === "assistant" && (
                  <DicebearAvatar
                    seed="assistant"
                    size={32}
                    imageUrl="/logo.svg"
                  />
                )}
              </AIMessage>
            );
          })}
        </AIConversationContent>
      </AIConversation>

      <Form {...form}>
        <AIInput
          className="relative rounded-none border-x-0 border-b-0"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            disabled={conversation?.status === "resolved"}
            name="message"
            render={({ field }) => (
              <AIInputTextarea
                disabled={conversation?.status === "resolved"}
                onChange={field.onChange}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                  }
                }}
                placeholder={
                  conversation?.status === "resolved"
                    ? "This conversation has been resolved"
                    : "Type your message..."
                }
                value={field.value}
              />
            )}
          />

          <AIInputToolbar>
            <AIInputTools></AIInputTools>
            <AIInputSubmit
              className="absolute bottom-1 right-1"
              disabled={
                conversation?.status === "resolved" ||
                !form.formState.isValid ||
                isPendingCreateMessage
              }
              status="ready"
              type="submit"
            />
          </AIInputToolbar>
        </AIInput>
      </Form>
    </>
  );
};
