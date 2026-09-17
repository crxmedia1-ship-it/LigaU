import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AdminPlaceholderProps = {
  title: string;
  description: string;
};

export function AdminPlaceholder({ title, description }: AdminPlaceholderProps) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Backoffice
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listo para Fase 3</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
