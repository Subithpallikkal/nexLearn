"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/store/hooks";
import { resetAuth } from "@/app/store/authSlice";
import { resetExam } from "@/app/store/examSlice";
import { authService } from "@/lib/auth";
import { clearExamSubmissionBundle } from "@/lib/examResultStorage";
import { clsx } from "clsx";

type ExamHeaderProps = {
  /** Tighter bar + larger logo for viewport-fit pages (e.g. instructions) */
  compact?: boolean;
};

export default function ExamHeader({ compact = false }: ExamHeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    const token = authService.getAccessToken();
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } catch {
        /* still clear locally */
      }
    }
    authService.logout();
    clearExamSubmissionBundle();
    dispatch(resetExam());
    dispatch(resetAuth());
    router.push("/create-account");
  };

  return (
    <header
      className={clsx(
        "relative flex shrink-0 items-center justify-center border-b border-slate-200/80 bg-white px-4",
        compact ? "py-2.5 sm:py-3" : "py-4 sm:px-8"
      )}
    >
      <img
        src="/namelogo2.svg"
        alt="NexLearn"
        width={265}
        height={84}
        className={clsx(
          "mx-auto w-auto object-contain ",
          compact
            ? "h-11 max-h-13 w-auto max-w-[min(320px,78vw)] sm:h-14 sm:max-h-14"
            : "h-10 sm:h-12"
        )}
      />
      <button
        type="button"
        onClick={handleLogout}
        className={clsx(
          "absolute top-1/2 -translate-y-1/2 inline-flex flex-row items-center justify-center gap-3 rounded-md bg-[#177A9C] px-4 py-1.75 font-semibold text-white transition-colors hover:bg-[#146a88] focus-visible:ring-2 focus-visible:ring-[#177A9C]/50 focus-visible:ring-offset-2",
          compact
            ? "right-3 h-10 min-w-22 w-auto gap-2 px-3 py-1.5 text-xs sm:right-5 sm:px-4 sm:py-2 sm:text-sm"
            : "right-4 h-11.25 w-25.25 text-sm sm:right-8"
        )}
      >
        Logout
      </button>
    </header>
  );
}
