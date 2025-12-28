import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Upload, Crop as CropIcon, Check, RotateCcw, Image as ImageIcon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageSizeGuideline {
  width: number;
  height: number;
  label: string;
  description?: string;
}

interface ImageUploadWithCropProps {
  onImageCropped: (file: File, previewUrl: string) => void;
  currentPreview?: string;
  guideline: ImageSizeGuideline;
  disabled?: boolean;
  required?: boolean;
  aspectRatio?: number;
  className?: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  onImageCropped,
  currentPreview,
  guideline,
  disabled = false,
  required = false,
  aspectRatio,
  className = '',
}) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropModal, setShowCropModal] = useState(false);
  const [preview, setPreview] = useState<string>(currentPreview || '');
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with currentPreview prop when it changes (e.g., when editing existing item)
  useEffect(() => {
    if (currentPreview && currentPreview !== preview) {
      setPreview(currentPreview);
    }
  }, [currentPreview]);

  const calculatedAspectRatio = aspectRatio || (guideline.width / guideline.height);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setShowCropModal(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, calculatedAspectRatio));
  }, [calculatedAspectRatio]);

  const getCroppedImg = useCallback(async (): Promise<{ file: File; previewUrl: string } | null> => {
    if (!completedCrop || !imgRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to the guideline dimensions for consistent output
    canvas.width = guideline.width;
    canvas.height = guideline.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    // Enable high quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Calculate the crop dimensions
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    // Draw the cropped image scaled to the guideline dimensions
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      guideline.width,
      guideline.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const file = new File([blob], `cropped-image-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          const previewUrl = URL.createObjectURL(blob);
          resolve({ file, previewUrl });
        },
        'image/jpeg',
        0.95, // High quality
      );
    });
  }, [completedCrop, guideline.width, guideline.height]);

  const handleApplyCrop = async () => {
    const result = await getCroppedImg();
    if (result) {
      setPreview(result.previewUrl);
      onImageCropped(result.file, result.previewUrl);
      setShowCropModal(false);
      setImgSrc('');
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  };

  const handleCancelCrop = () => {
    setShowCropModal(false);
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetCrop = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, calculatedAspectRatio));
    }
  };

  return (
    <div className={className}>
      {/* Size Guideline Info */}
      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-800">{guideline.label}</p>
            <p className="text-blue-600">
              Recommended size: <span className="font-semibold">{guideline.width} x {guideline.height}px</span>
            </p>
            {guideline.description && (
              <p className="text-blue-500 text-xs mt-1">{guideline.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!preview ? (
        <label
          className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className={`w-10 h-10 mb-3 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
            <p className={`mb-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF or WebP (max. 2MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
            onChange={onSelectFile}
            disabled={disabled}
            required={required && !preview}
            className="hidden"
          />
        </label>
      ) : (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
            <label className="p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <CropIcon className="w-5 h-5 text-gray-700" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                onChange={onSelectFile}
                disabled={disabled}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={disabled}
              className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {guideline.width} x {guideline.height}px
          </div>
        </div>
      )}

      {/* Crop Modal */}
      <AnimatePresence>
        {showCropModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[60]"
              onClick={handleCancelCrop}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <CropIcon className="w-5 h-5 text-primary-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Crop Image</h3>
                      <p className="text-sm text-gray-500">
                        Adjust to fit {guideline.width} x {guideline.height}px
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelCrop}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Crop Area */}
                <div className="p-4 bg-gray-100 max-h-[60vh] overflow-auto flex items-center justify-center">
                  {imgSrc && (
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={calculatedAspectRatio}
                      className="max-w-full"
                    >
                      <img
                        ref={imgRef}
                        alt="Crop"
                        src={imgSrc}
                        onLoad={onImageLoad}
                        className="max-h-[50vh] max-w-full"
                      />
                    </ReactCrop>
                  )}
                </div>

                {/* Preview and Actions */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ImageIcon className="w-4 h-4" />
                      <span>Output: {guideline.width} x {guideline.height}px</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleResetCrop}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelCrop}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyCrop}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all"
                      >
                        <Check className="w-4 h-4" />
                        Apply Crop
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Predefined size guidelines for common use cases
export const IMAGE_GUIDELINES = {
  banner: {
    width: 1920,
    height: 600,
    label: 'Banner Image',
    description: 'Wide format for hero sections and page headers',
  },
  teamMember: {
    width: 400,
    height: 400,
    label: 'Team Member Photo',
    description: 'Square format for profile pictures',
  },
  course: {
    width: 800,
    height: 600,
    label: 'Course Image',
    description: 'Landscape format for course cards',
  },
  trip: {
    width: 800,
    height: 600,
    label: 'Trip Image',
    description: 'Landscape format for trip cards',
  },
  product: {
    width: 600,
    height: 600,
    label: 'Product Image',
    description: 'Square format for product listings',
  },
  blog: {
    width: 1200,
    height: 630,
    label: 'Blog Featured Image',
    description: 'Optimal for social sharing (1.91:1 ratio)',
  },
  event: {
    width: 800,
    height: 450,
    label: 'Event Image',
    description: 'Wide format for event cards (16:9 ratio)',
  },
  initiative: {
    width: 800,
    height: 600,
    label: 'Initiative Image',
    description: 'Landscape format for initiative cards',
  },
};
