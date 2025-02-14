"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AuthPage() {
  const { signInWithGoogle, signInWithGithub } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
      router.push("/problems");
      toast.success(isSignUp ? "Successfully signed up with Google!" : "Successfully logged in with Google!");
    } catch (error) {
      toast.error(isSignUp ? "Failed to sign up with Google." : "Failed to log in with Google.");
    }
  };

  const handleGithubAuth = async () => {
    try {
      await signInWithGithub();
      router.push("/problems");
      toast.success(isSignUp ? "Successfully signed up with GitHub!" : "Successfully logged in with GitHub!");
    } catch (error) {
      toast.error(isSignUp ? "Failed to sign up with GitHub." : "Failed to log in with GitHub.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        <motion.div
          initial={false}
          animate={{ height: "auto" }}
          className="overflow-hidden"
        >
          <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
            Welcome to Leetr
          </h2>
          <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
            Sign in to continue your interview preparation journey
          </p>

          <div className="my-8">
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleGithubAuth}
                type="button"
                className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
              >
                <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                  Continue with GitHub
                </span>
                <BottomGradient />
              </button>
              <button
                onClick={handleGoogleAuth}
                type="button"
                className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
              >
                <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
                <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                  Continue with Google
                </span>
                <BottomGradient />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};