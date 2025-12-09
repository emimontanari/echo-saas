"use client";
import { AlertTriangleIcon } from "lucide-react";
import { useScreenError } from "@/modules/widget/store/use-screen-store";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";

const WidgetErrorScreen = () => {
  const errorMessage = useScreenError();

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col items-center justify-center">
          <p>Something went wrong</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <AlertTriangleIcon />

        <p className="text-sm">{errorMessage || "An error occurred"}</p>
      </div>
    </>
  );
};

export default WidgetErrorScreen;
