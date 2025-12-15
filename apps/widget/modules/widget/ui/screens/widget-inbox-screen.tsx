"use client";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { formatDistanceToNow } from "date-fns";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeftIcon } from "lucide-react";
import { useContactSessionId } from "../../store/use-contact-session-store";
import { useScreenActions } from "../../store/use-screen-store";
import { useConversationActions } from "../../store/use-conversation-store";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { WIDGET_SCREENS } from "../../types";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { useState } from "react";
import { WidgetFooter } from "../components/widget-footer";

const WidgetInboxScreen = () => {
  const contactSessionId = useContactSessionId();
  const { setScreen } = useScreenActions();
  const { setConversationId } = useConversationActions();
  const [isLoading, setIsLoading] = useState(false);

  const conversations = usePaginatedQuery(
    api.public.conversations.getMany,
    contactSessionId
      ? {
          contactSessionId,
        }
      : "skip",
    {
      initialNumItems: 10,
    },
  );

  const { topElementRef, hadleLoadMore, canLoadMore, isLoadingMore } =
    useInfiniteScroll({
      status: conversations.status,
      loadMore: conversations.loadMore,
      loadSize: 10,
    });

  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-x-2">
          <Button
            size="icon"
            variant="transparent"
            onClick={() => setScreen("selection")}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <p className="text-lg font-medium">Inbox</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col gap-y-2 overflow-y-auto p-4">
        {isLoading ? (
          "Loading..."
        ) : conversations?.results.length > 0 ? (
          <>
            {conversations?.results.map((conversation) => (
              <Button
                key={conversation._id}
                className="h-20 w-full justify-between"
                onClick={() => {
                  setConversationId(conversation._id);
                  setScreen(WIDGET_SCREENS.CHAT);
                }}
                variant="outline"
              >
                <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
                  <div className="flex w-full items-center justify-between gap-x-2">
                    <p className="text-muted-foreground text-xs">Chat</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDistanceToNow(
                        new Date(conversation._creationTime),
                      )}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-x-2">
                    <p className="truncate text-sm">
                      {conversation.lastMessage?.text}
                    </p>
                    <ConversationStatusIcon
                      status={conversation.status}
                      className="shrink-0"
                    />
                  </div>
                </div>
              </Button>
            ))}
            <InfiniteScrollTrigger
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={hadleLoadMore}
              ref={topElementRef}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4">
            <p className="text-sm">No conversations found</p>
          </div>
        )}
      </div>
      <WidgetFooter />
    </>
  );
};

export default WidgetInboxScreen;
