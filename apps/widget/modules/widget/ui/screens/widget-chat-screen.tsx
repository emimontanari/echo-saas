import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { MessageSquareTextIcon } from "lucide-react";
import { useConversationId } from "@/modules/widget/store/use-conversation-store";

export const WidgetChatScreen = () => {
  const conversationId = useConversationId();

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6">
          <p className="text-3xl">Chat</p>
          <p className="text-sm text-muted-foreground">
            Conversation ID: {conversationId}
          </p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4">
        <MessageSquareTextIcon className="size-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Chat interface coming soon...
        </p>
      </div>
    </>
  );
};
