import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

const Page = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <SignUp />
      </Suspense>
    </div>
  );
};

export default Page;
