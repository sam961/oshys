import React, { useState } from 'react';
import { Star, Trash2, Plus, Loader2, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploadWithCrop } from './ImageUploadWithCrop';
import type { Image } from '../../types';
import toast from 'react-hot-toast';

interface ImageSizeGuideline {
  width: number;
  height: number;
  label: string;
  description?: string;
}

interface MultiImageGalleryProps {
  images: Image[];
  mainImagePath?: string;
  guideline: ImageSizeGuideline;
  disabled?: boolean;
  onUpload: (files: FormData) => Promise<void>;
  onDelete: (imageId: number) => Promise<void>;
  onSetMain: (imageId: number) => Promise<void>;
  onReorder: (order: { id: number; order: number }[]) => Promise<void>;
}

export const MultiImageGallery: React.FC<MultiImageGalleryProps> = ({
  images,
  mainImagePath,
  guideline,
  disabled = false,
  onUpload,
  onDelete,
  onSetMain,
  onReorder,
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingMainId, setSettingMainId] = useState<number | null>(null);

  const isProcessing = isUploading || deletingId !== null || settingMainId !== null || disabled;

  const handleImageCropped = async (file: File) => {
    const formData = new FormData();
    formData.append('images[]', file);
    setIsUploading(true);
    try {
      await onUpload(formData);
      toast.success('Image uploaded');
      setShowUploadModal(false);
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!window.confirm('Delete this image?')) return;
    setDeletingId(imageId);
    try {
      await onDelete(imageId);
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetMain = async (imageId: number) => {
    setSettingMainId(imageId);
    try {
      await onSetMain(imageId);
      toast.success('Main image updated');
    } catch {
      toast.error('Failed to set main image');
    } finally {
      setSettingMainId(null);
    }
  };

  const handleMoveLeft = async (index: number) => {
    if (index === 0) return;
    const reordered = [...images];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    const order = reordered.map((img, i) => ({ id: img.id, order: i }));
    try {
      await onReorder(order);
    } catch {
      toast.error('Failed to reorder');
    }
  };

  const handleMoveRight = async (index: number) => {
    if (index === images.length - 1) return;
    const reordered = [...images];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    const order = reordered.map((img, i) => ({ id: img.id, order: i }));
    try {
      await onReorder(order);
    } catch {
      toast.error('Failed to reorder');
    }
  };

  const isMainImage = (img: Image) => {
    return img.collection === 'main' || img.path === mainImagePath;
  };

  return (
    <div>
      {/* Guideline Info */}
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

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, index) => {
          const isMain = isMainImage(img);
          const imageUrl = img.full_url || img.url;

          return (
            <motion.div
              key={img.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group rounded-lg overflow-hidden border-2 border-gray-200 aspect-[4/3]"
              style={isMain ? { borderColor: '#d97706' } : undefined}
            >
              <img
                src={imageUrl}
                alt={img.filename}
                className="w-full h-full object-cover"
              />

              {/* Main badge */}
              {isMain && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow">
                  <Star className="w-3 h-3 fill-current" />
                  Main
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!isMain && (
                  <button
                    type="button"
                    onClick={() => handleSetMain(img.id)}
                    disabled={isProcessing}
                    className="p-2 bg-white rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50"
                    title="Set as main image"
                  >
                    {settingMainId === img.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    ) : (
                      <Star className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                )}

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMoveLeft(index)}
                    disabled={isProcessing}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Move left"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                )}

                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMoveRight(index)}
                    disabled={isProcessing}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Move right"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  disabled={isProcessing}
                  className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Delete image"
                >
                  {deletingId === img.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-600" />
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Add Image Tile */}
        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          disabled={isProcessing}
          className="relative rounded-lg border-2 border-dashed border-gray-300 aspect-[4/3] flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          ) : (
            <Plus className="w-8 h-8 text-gray-400" />
          )}
          <span className="text-sm text-gray-500 font-medium">
            {isUploading ? 'Uploading...' : 'Add Image'}
          </span>
        </button>
      </div>

      {images.length === 0 && (
        <p className="text-sm text-gray-400 mt-2">No images yet. Click "Add Image" to upload.</p>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowUploadModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Image</h3>
                <ImageUploadWithCrop
                  onImageCropped={(file) => handleImageCropped(file)}
                  guideline={guideline}
                  disabled={isUploading}
                />
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
