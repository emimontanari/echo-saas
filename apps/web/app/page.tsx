"use client";
import { Authenticated, Unauthenticated, useMutation, useQuery } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";

export default function Page() {
  const users = useQuery(api.users.getMany);
  const addUser = useMutation(api.users.add);

  return (
    <>
      <Authenticated>
        <div className="flex flex-col items-center justify-center min-h-svh">
          <UserButton />
          <Button onClick={() => addUser()}>Add</Button>
          <div className="max-w-sm w-full mx-auto">
            {JSON.stringify(users, null, 2)}
          </div>
        </div>
      </Authenticated >
      <Unauthenticated>
        <SignInButton>
          <Button>Sign In</Button>
        </SignInButton>
      </Unauthenticated>
    </>
  );
}
