"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { getCroppedBlob } from "@/lib/crop-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

type ImageCropModalProps = {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (blob: Blob) => void;
  isProcessing: boolean;
  processingLabel: string;
  error: string | null;
};

export default function ImageCropModal({
  imageSrc,
  open,
  onClose,
  onConfirm,
  isProcessing,
  processingLabel,
  error,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
    onConfirm(blob);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-5xl" showCloseButton={!isProcessing}>
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Adjust the crop area and zoom to frame your header image.
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-[450px] bg-muted rounded-md overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={5 / 2}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground shrink-0">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
            disabled={isProcessing}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isProcessing || !croppedAreaPixels}>
            {isProcessing ? processingLabel : "Crop & Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
