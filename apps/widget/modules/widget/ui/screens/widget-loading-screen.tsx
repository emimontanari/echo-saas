"use client";
import { LoaderIcon } from "lucide-react";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { useEffect, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { useScreenActions, useScreenLoadingMessage } from "@/modules/widget/store/use-screen-store";
import { useContactSessionId } from "@/modules/widget/store/use-contact-session-store";

type InitStep = "org" | "session" | "settings" | "vapi" | "done";

const WidgetLoadingScreen = ({
  organizationId,
}: {
  organizationId: string | null;
}) => {
  const [step, setStep] = useState<InitStep>("org");
  const [sessionValid, setSessionValid] = useState(false);
  const { setScreen, setError, setLoadingMessage, setOrgId } = useScreenActions();
  const loadingMessage = useScreenLoadingMessage();
  const contactSessionId = useContactSessionId();

  const validateOrganization = useAction(api.public.organizations.validate);

  useEffect(() => {
    if (step !== "org") return;

    setLoadingMessage("Validating organization ID...");
    if (!organizationId) {
      setError("Organization ID is required");
      setScreen("error");
      return;
    }

    setLoadingMessage("Finding organization ID...");

    validateOrganization({ id: organizationId })
      .then((result) => {
        if (result.valid) {
          setOrgId(organizationId);
          setStep("session");
        } else {
          setError(result.message || "Organization not found");
          setScreen("error");
        }
      })
      .catch(() => {
        setError("Unable to validate organization");
        setScreen("error");
      });
  }, [
    step,
    organizationId,
    setError,
    setScreen,
    setOrgId,
    setStep,
    validateOrganization,
    setLoadingMessage,
  ]);
  // Step 2: validate session (if exists)
  const validateContactSession = useMutation(
    api.public.contactSessions.validate
  );

  useEffect(() => {
    if (step !== "session") return;

    setLoadingMessage("Finding contact session ID...");
    if (!contactSessionId) {
      setSessionValid(false);
      setStep("done");
      return;
    }

    setLoadingMessage("Validating session...");

    validateContactSession({
      id: contactSessionId,
    })
      .then((result) => {
        setSessionValid(result.valid);
        setStep("done");
      })
      .catch(() => {
        setSessionValid(false);
        setStep("done");
      });
  }, [step, contactSessionId, validateContactSession, setLoadingMessage]);

  useEffect(() => {
    if (step !== "done") return;

    const hasValidSession = contactSessionId && sessionValid;

    setScreen(hasValidSession ? "selection" : "auth");
  }, [step, contactSessionId, sessionValid, setScreen]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6">
          <p className="font-semibold text-3xl">Hi There!👋🏻 </p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <LoaderIcon className="animate-spin" />
        <p className="text-sm">{loadingMessage || "Loading..."}</p>
      </div>
    </>
  );
};

export default WidgetLoadingScreen;
