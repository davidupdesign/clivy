"use client";

import { useState, useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";
import ImageCropModal from "@/components/image-crop-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ImageUploadFieldProps = {
  initialImage?: string | null;
  onImageChange: (url: string | null) => void;
};

const MAX_RAW_BYTES = 10 * 1024 * 1024; // 10MB before compression

export default function ImageUploadField({
  initialImage,
  onImageChange,
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(initialImage ?? null);

  // sync when parent provides initialImage after async fetch
  useEffect(() => {
    if (initialImage) setPreview(initialImage);
  }, [initialImage]);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const mountedRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);
    setUploadError(null);

    if (!file.type.startsWith("image/")) {
      setValidationError("File must be an image (PNG, JPG, WebP, etc.)");
      return;
    }

    if (file.size > MAX_RAW_BYTES) {
      setValidationError("Image must be 10MB or smaller");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setRawImageSrc(reader.result);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);

    // reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropConfirm = async (blob: Blob) => {
    setIsProcessing(true);
    setUploadError(null);

    try {
      // compress
      setProcessingLabel("Compressing...");
      const compressed = await imageCompression(
        new File([blob], "header.jpg", { type: "image/jpeg" }),
        {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: false,
        },
      );

      // upload
      setProcessingLabel("Uploading...");
      const formData = new FormData();
      formData.append("file", compressed, "header.jpg");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setUploadError(`Server error: ${text.slice(0, 200)}`);
        setIsProcessing(false);
        return;
      }

      if (!response.ok) {
        setUploadError(data.error || "Upload failed");
        setIsProcessing(false);
        return;
      }

      setPreview(data.url);
      onImageChange(data.url);
      setCropModalOpen(false);
      setRawImageSrc(null);
    } catch (err) {
      console.error("Crop/upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingLabel("");
    }
  };

  const [loadingUrl, setLoadingUrl] = useState(false);

  const handleUrlConfirm = async () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    setValidationError(null);
    setUploadError(null);
    setLoadingUrl(true);

    try {
      // proxy through our server to avoid CORS tainted canvas
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(trimmed)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setValidationError(data.error || "Failed to load image from URL");
        setLoadingUrl(false);
        return;
      }

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setRawImageSrc(reader.result);
          setCropModalOpen(true);
        }
        setLoadingUrl(false);
      };
      reader.readAsDataURL(blob);
    } catch {
      setValidationError("Failed to load image from URL");
      setLoadingUrl(false);
    }
    setImageUrlInput("");
  };

  const handleRemove = () => {
    setPreview(null);
    setRawImageSrc(null);
    setImageUrlInput("");
    setValidationError(null);
    setUploadError(null);
    onImageChange(null);
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative max-w-md">
          <div
            className="w-full overflow-hidden rounded-lg"
            style={{ aspectRatio: "5/2" }}
          >
            <img
              src={preview}
              alt="Header preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded hover:bg-black/70 transition-colors"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* File upload */}
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleFileSelect}
              />
              <span className="inline-flex items-center gap-2 px-5 py-3 border rounded-lg text-lg hover:bg-muted transition-colors">
                Upload image
              </span>
            </label>
            <span className="text-lg text-muted-foreground">Max 10MB</span>
          </div>

          {/* URL input */}
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Or paste an image URL"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="flex-1 h-13 text-lg"
            />
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleUrlConfirm}
              disabled={!imageUrlInput.trim() || loadingUrl}
              className="h-13 px-8 text-base"
            >
              {loadingUrl ? "Loading..." : "Use URL"}
            </Button>
          </div>
        </div>
      )}

      {validationError && (
        <p className="text-sm text-red-500">{validationError}</p>
      )}

      {rawImageSrc && (
        <ImageCropModal
          imageSrc={rawImageSrc}
          open={cropModalOpen}
          onClose={() => {
            setCropModalOpen(false);
            setRawImageSrc(null);
            setUploadError(null);
          }}
          onConfirm={handleCropConfirm}
          isProcessing={isProcessing}
          processingLabel={processingLabel}
          error={uploadError}
        />
      )}
    </div>
  );
}
