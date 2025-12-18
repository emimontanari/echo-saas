"use client";
import { getContryFromTimezone, getCountryFlagUrl } from "@/lib/country-utils";
import { formatDistanceToNow } from "date-fns";
import { api } from "@workspace/backend/_generated/api";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { cn } from "@workspace/ui/lib/utils";
import { usePaginatedQuery } from "convex/react";
import {
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  CornerUpLeftIcon,
  ListIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai/react";
import { statusFilterAtom } from "../../atoms";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";

export const ConversationsPanel = () => {
  const pathname = usePathname();
  const statusFilter = useAtomValue(statusFilterAtom);
  const setStatusFilter = useSetAtom(statusFilterAtom);

  const conversations = usePaginatedQuery(
    api.private.conversations.getMany,
    {
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    {
      initialNumItems: 10,
    }
  );

  const {
    topElementRef,
    hadleLoadMore,
    canLoadMore,
    isLoadingMore,
    isLoadingFirstPage,
  } = useInfiniteScroll({
    status: conversations.status,
    loadMore: conversations.loadMore,
    loadSize: 2,
    observerEnabled: false,
  });

  return (
    <div className="flex h-full w-full flex-col bg-background text-sidebar-foreground">
      <div className="flex flex-col gap-3.5 border-b p-2">
        <Select
          defaultValue="all"
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(
              value as "unresolved" | "escalated" | "resolved" | "all"
            )
          }
        >
          <SelectTrigger className="hover:bg-accent hover:text-accent-foreground h-8 border-none px-1.5 shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <SelectValue placeholder="Select a conversation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <ListIcon className="h-4 w-4" />
                <span>All</span>
              </div>
            </SelectItem>

            <SelectItem value="unresolved">
              <div className="flex items-center gap-2">
                <ArrowRightIcon className="h-4 w-4" />
                <span>Unresolved</span>
              </div>
            </SelectItem>

            <SelectItem value="escalated">
              <div className="flex items-center gap-2">
                <ArrowUpIcon className="h-4 w-4" />
                <span>Escalated</span>
              </div>
            </SelectItem>

            <SelectItem value="resolved">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4" />
                <span>Resolved</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoadingFirstPage ? (
        <ConversationsSkeleton />
      ) : (
        <ScrollArea className="max-h-[calc(100vh-53px)] ">
          <div className="flex w-full flex-col text-sm">
            {conversations.results.map((conversation) => {
              const isLastMessageFromOperator =
                conversation.lastMessage?.message?.role !== "user";

              const country = getContryFromTimezone(
                conversation.contactSession.metadata?.timezone
              );

              const countryFlagUrl = country
                ? getCountryFlagUrl(country.countryCode)
                : null;
              return (
                <Link
                  key={conversation._id}
                  href={`/conversations/${conversation._id}`}
                  className={cn(
                    "hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-start gap-3 border-b p-4 text-sm leading-tight",
                    pathname === `/conversations/${conversation._id}` &&
                      "bg-accent text-accent-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "--translate-y-1/2 absolute left-0 top-1/2 h-[64%] w-1 rounded-r-full bg-neutral-300 opacity-0 transition-opacity duration-300",
                      pathname === `/conversations/${conversation._id}` &&
                        "opacity-100"
                    )}
                  />
                  <DicebearAvatar
                    seed={conversation.contactSession._id}
                    size={40}
                    className="shrink-0"
                    badgeImageUrl={countryFlagUrl ?? "/logo.svg"}
                  />

                  <div className="flex-1">
                    <div className="flex w-full items-center gap-2">
                      <span className="truncate font-semibold">
                        {conversation.contactSession.name}
                      </span>
                      <span className="text-muted-foreground ml-auto shrink-0 text-xs">
                        {formatDistanceToNow(
                          new Date(conversation._creationTime)
                        )}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <div className="flex flex-1 items-center gap-1">
                        {isLastMessageFromOperator && (
                          <CornerUpLeftIcon className="text-muted-foreground size-3 shrink-0" />
                        )}
                        <span
                          className={cn(
                            "text-muted-foreground line-clamp-1 text-xs",
                            !isLastMessageFromOperator && "font-bold text-black"
                          )}
                        >
                          {conversation.lastMessage?.text}
                        </span>
                      </div>
                      <ConversationStatusIcon status={conversation.status} />
                    </div>
                  </div>
                </Link>
              );
            })}
            <InfiniteScrollTrigger
              canLoadMore={canLoadMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={hadleLoadMore}
              ref={topElementRef}
            />
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

const ConversationsSkeleton = () => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
      <div className="relative flex w-full min-w-0 flex-col p-2">
        <div className="w-full space-y-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3 rounded-lg p-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="ml-auto h-3 w-12 shrink-0" />
                </div>
                <div className="mt-2">
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
