import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Doc } from "@workspace/backend/_generated/dataModel";
import { WidgetFooter } from "../components/widget-footer";
import { useScreenOrgId } from "@/modules/widget/store/use-screen-store";
import { useContactSessionActions } from "@/modules/widget/store/use-contact-session-store";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export const WidgetAuthScreen = () => {
  const organizationId = useScreenOrgId();
  const { setContactSessionId } = useContactSessionActions();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const createContactSession = useMutation(api.public.contactSessions.create);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!organizationId) return;

    const metadata: Doc<"contactSessions">["metadata"] = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages
        ? Array.from(navigator.languages)
        : undefined,
      platform: navigator.platform,
      vendor: navigator.vendor,
      screenResolution: {
        width: screen.width,
        height: screen.height,
      },
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timezoneOffset: new Date().getTimezoneOffset(),
      cookieEnabled: navigator.cookieEnabled,
      referrer: document.referrer || "direct",
      currentUrl: window.location.href,
    };
    console.log(metadata);

    const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    const contactSessionsId = await createContactSession({
      ...values,
      orgId: organizationId,

      metadata,
    });

    setContactSessionId(contactSessionsId.id);
  };

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6">
          <p className="font-semibold text-3xl">Hi There!👋🏻 </p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-y-6 p-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. John Doe"
                    required
                    className="h-10 bg-background"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. john@doe.com"
                    required
                    className="h-10 bg-background"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={form.formState.isSubmitting}
            size={"lg"}
            type="submit"
          >
            Continue
          </Button>
        </form>
      </Form>
      <WidgetFooter />
    </>
  );
};
