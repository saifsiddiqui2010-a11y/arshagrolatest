import React, { useId, useState } from 'react';
import { uploadAdminImage } from '../services/imageUpload';

interface ImageUploadFieldProps {
  value: string;
  folder: 'products' | 'website';
  onChange: (imageUrl: string) => void;
  onUploadingChange?: (delta: 1 | -1) => void;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  folder,
  onChange,
  onUploadingChange,
}) => {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    setError('');
    setIsUploading(true);
    onUploadingChange?.(1);
    try {
      onChange(await uploadAdminImage(file, folder));
    } catch (uploadError) {
      console.error('Could not upload image:', uploadError);
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload image.');
    } finally {
      setIsUploading(false);
      onUploadingChange?.(-1);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block font-semibold text-stone-700">Upload image</label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(event) => void handleFileChange(event)}
        disabled={isUploading}
        className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100 disabled:opacity-60"
      />
      <p className="text-xs text-stone-500">JPG, PNG, WebP, or GIF · up to 5 MB</p>
      {isUploading && <p role="status" className="text-xs font-medium text-emerald-800">Uploading image…</p>}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      {value && (
        <img
          src={value}
          alt="Selected image preview"
          className="max-h-40 w-auto max-w-full rounded-lg border border-stone-200 object-contain"
        />
      )}
    </div>
  );
};
