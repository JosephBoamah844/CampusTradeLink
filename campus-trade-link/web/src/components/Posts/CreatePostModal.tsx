import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePostSchema } from '@campus-trade-link/shared';
import { postApi, uploadApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Modal from '@/components/UI/Modal';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (post: any) => void;
}

interface CreatePostFormData {
  content: string;
  imageUrls?: string[];
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(CreatePostSchema),
  });

  const content = watch('content');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxImages = 4;

    if (selectedFiles.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);
    try {
      const response = await uploadApi.uploadMultiple(selectedFiles);
      const urls = response.data.data.map((upload: any) => upload.url);
      setUploadedImages(urls);
      return urls;
    } catch (error) {
      console.error('Failed to upload images:', error);
      toast.error('Failed to upload images');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: CreatePostFormData) => {
    try {
      // Upload images first if any
      const imageUrls = await uploadImages();

      // Create post
      const response = await postApi.createPost({
        content: data.content,
        imageUrls,
      });

      toast.success('Post created successfully!');
      onPostCreated?.(response.data.data);
      handleClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedFiles([]);
    setUploadedImages([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Post"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Content Input */}
        <div>
          <textarea
            {...register('content')}
            placeholder="What's happening on campus?"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {content?.length || 0}/2000
            </span>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images (optional)
          </label>
          
          {/* Selected Images Preview */}
          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {selectedFiles.length < 4 && (
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload images</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB each (max 4 images)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting || isUploading}
            disabled={!content?.trim() || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Post'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}