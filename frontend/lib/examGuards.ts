import { authService } from "@/lib/auth";
import { hasSuccessfulSubmission } from "@/lib/examResultStorage";

type RouterLike = { replace: (href: string) => void };

/** Token + not already submitted. Returns false if redirected. */
export function requireExamAccess(router: RouterLike): boolean {
  if (!authService.getAccessToken()) {
    router.replace("/create-account");
    return false;
  }
  if (hasSuccessfulSubmission()) {
    router.replace("/exam/result");
    return false;
  }
  return true;
}

/** Logged-in home: result → instructions → create-account */
export function redirectHome(router: RouterLike): void {
  if (!authService.getAccessToken()) {
    router.replace("/create-account");
    return;
  }
  if (hasSuccessfulSubmission()) {
    router.replace("/exam/result");
    return;
  }
  router.replace("/exam/instructions");
}
