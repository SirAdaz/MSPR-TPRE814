import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  backHref: string;
  backLabel?: string;
  items: BreadcrumbItem[];
};

export function PageHeaderNav({ backHref, backLabel = "Retour", items }: Props) {
  return (
    <div className="mb-6 space-y-3">
      <Link href={backHref}>
        <Button size="sm" variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Button>
      </Link>
      <nav className="text-sm text-zinc-600">
        {items.map((item, index) => (
          <span key={`${item.label}-${item.href ?? "current"}`}>
            {index > 0 ? " / " : ""}
            {item.href ? <Link className="hover:underline" href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
          </span>
        ))}
      </nav>
    </div>
  );
}
