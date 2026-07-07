import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <Logo variant="header" className="mb-10" />
      <p className="label-micro text-faint">404</p>
      <h1 className="text-display mt-3 text-3xl">Room not found</h1>
      <p className="mt-3 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        This wing or protocol does not exist. Check the URL or return to the facility map.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/experiments">Experiments</Link>
        </Button>
      </div>
    </div>
  );
}
