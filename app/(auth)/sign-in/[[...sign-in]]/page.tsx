// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

const Page = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <SignIn />
      </Suspense>
    </div>
  );
};

export default Page;
