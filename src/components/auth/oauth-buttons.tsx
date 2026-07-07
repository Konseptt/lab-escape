import {
  continueAsGuest,
  signInWithGitHub,
  signInWithGoogle,
} from "@/app/actions/auth-actions";
import { oauthEnabled } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.68-.06-1.36-.19-2.02H12v3.83h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.22c1.89-1.73 2.98-4.3 2.98-7.33Z"
      />
      <path
        fill="currentColor"
        opacity="0.7"
        d="M12 21.94c2.7 0 4.96-.89 6.62-2.4l-3.23-2.5c-.9.6-2.05.95-3.39.95-2.6 0-4.8-1.75-5.59-4.1H3.08v2.58A10 10 0 0 0 12 21.94Z"
      />
      <path
        fill="currentColor"
        opacity="0.5"
        d="M6.41 13.89a5.99 5.99 0 0 1 0-3.83V7.48H3.08a10 10 0 0 0 0 8.99l3.33-2.58Z"
      />
      <path
        fill="currentColor"
        opacity="0.85"
        d="M12 5.95c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.97 9.97 0 0 0 12 2a10 10 0 0 0-8.92 5.48l3.33 2.58C7.2 7.7 9.4 5.95 12 5.95Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
      />
    </svg>
  );
}

export function OAuthButtons() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <form action={signInWithGoogle}>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={!oauthEnabled.google}
            title={
              oauthEnabled.google
                ? undefined
                : "Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET"
            }
          >
            <GoogleIcon />
            Google
          </Button>
        </form>
        <form action={signInWithGitHub}>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={!oauthEnabled.github}
            title={
              oauthEnabled.github
                ? undefined
                : "Set AUTH_GITHUB_ID and AUTH_GITHUB_SECRET"
            }
          >
            <GitHubIcon />
            GitHub
          </Button>
        </form>
      </div>
      <div className="flex items-center gap-3 py-1">
        <Separator className="flex-1" />
        <span className="label-micro text-faint">or</span>
        <Separator className="flex-1" />
      </div>
      <form action={continueAsGuest}>
        <Button type="submit" variant="secondary" className="w-full">
          Continue as guest
        </Button>
      </form>
      <p className="text-center text-[11px] leading-relaxed text-faint">
        Guest data stays in this browser.
      </p>
    </div>
  );
}
