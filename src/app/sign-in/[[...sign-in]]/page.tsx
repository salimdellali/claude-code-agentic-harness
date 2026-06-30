import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#f5f5f5] py-12">
      <SignIn />
    </div>
  );
}
