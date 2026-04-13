import Link from "next/link";

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
      <Link className="btn btn-outline btn-sm" href={backHref}>
        ← {backLabel}
      </Link>
      <div className="breadcrumbs text-sm">
        <ul>
          {items.map((item) => (
            <li key={`${item.label}-${item.href ?? "current"}`}>
              {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
