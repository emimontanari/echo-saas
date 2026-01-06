import { ConversationIdView } from "@/modules/dashboard/ui/views/conversation-id-view";
import { Id } from "@workspace/backend/_generated/dataModel";

const Page = async ({
  params,
}: {
  params: Promise<{
    conversationsId: string;
  }>;
}) => {
  const { conversationsId } = await params;

  return (
    <ConversationIdView
      conversationId={conversationsId as Id<"conversations">}
    />
  );
};

export default Page;
