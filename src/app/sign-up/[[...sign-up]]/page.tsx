import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#f5f5f5] py-12">
      <SignUp />
    </div>
  );
}
