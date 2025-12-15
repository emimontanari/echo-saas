"use client";
import { WidgetAuthScreen } from "@/modules/widget/ui/screens/widget-auth-screen";
import { useScreen } from "@/modules/widget/store/use-screen-store";
import WidgetErrorScreen from "@/modules/widget/ui/screens/widget-error-screen";
import WidgetLoadingScreen from "../screens/widget-loading-screen";
import { WidgetSelectionScreen } from "../screens/widget-selection-screen";
import { WidgetChatScreen } from "../screens/widget-chat-screen";
import WidgetInboxScreen from "../screens/widget-inbox-screen";

interface Props {
  organizationId: string | null;
}

export const WidgetView = ({ organizationId }: Props) => {
  const screen = useScreen();

  const screenComponent = {
    error: <WidgetErrorScreen />,
    loading: <WidgetLoadingScreen organizationId={organizationId} />,
    auth: <WidgetAuthScreen />,
    selection: <WidgetSelectionScreen />,
    voice: <p>TODO: Voice</p>,
    inbox: <WidgetInboxScreen />,
    chat: <WidgetChatScreen />,
    contact: <p>TODO: Contact</p>,
  };
  return (
    <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponent[screen]}
    </main>
  );
};
