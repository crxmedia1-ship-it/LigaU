"use client";

import { useEffect, useState, useTransition } from "react";
import { ImageUpIcon, Loader2Icon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  uploadImageAction,
  type CloudinaryFolder,
  type CloudinaryUploadSuccess,
} from "@/lib/cloudinary";

type ImageUploaderProps = {
  folder: CloudinaryFolder;
  path?: string;
  label?: string;
  initialUrl?: string | null;
  onUploaded?: (asset: CloudinaryUploadSuccess) => void;
};

export function ImageUploader({
  folder,
  path,
  label = "Subir imagen",
  initialUrl,
  onUploaded,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setPreview(initialUrl ?? null);
  }, [initialUrl]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    if (path) formData.append("path", path);

    startTransition(async () => {
      const result = await uploadImageAction(formData);
      if (!result.ok) {
        toast.add({
          type: "error",
          title: "No se pudo subir la imagen",
          description: result.error,
        });
        return;
      }

      setPreview(result.secureUrl);
      onUploaded?.(result);
      toast.add({
        type: "success",
        title: "Imagen subida",
        description: "Cloudinary guardó el archivo con firma de servidor.",
      });
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="lg" className="relative h-10" disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin" /> : <ImageUpIcon />}
          {pending ? "Subiendo..." : label}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={pending}
            onChange={handleChange}
          />
        </Button>
        <p className="text-xs text-muted-foreground">JPG, PNG, WEBP o GIF · máx. 8 MB</p>
      </div>
      {preview ? (
        <img
          src={preview}
          alt="Vista previa Cloudinary"
          className="h-36 w-36 rounded-xl object-cover ring-1 ring-border"
        />
      ) : null}
    </div>
  );
}
