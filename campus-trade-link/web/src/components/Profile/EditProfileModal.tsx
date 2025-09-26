import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateUserSchema, User } from '@campus-trade-link/shared';
import { userApi, uploadApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Modal from '@/components/UI/Modal';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import { PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (user: User) => void;
}

interface UpdateProfileFormData {
  username: string;
  displayName?: string;
  bio?: string;
}

export default function EditProfileModal({ isOpen, onClose, user, onUpdate }: EditProfileModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user.profileImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      username: user.username,
      displayName: user.displayName || '',
      bio: user.bio || '',
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Image must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadProfileImage = async (): Promise<string | undefined> => {
    if (!selectedFile) return previewUrl || undefined;

    setIsUploading(true);
    try {
      const response = await uploadApi.uploadSingle(selectedFile);
      return response.data.data.url;
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      toast.error('Failed to upload profile image');
      return undefined;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: UpdateProfileFormData) => {
    try {
      // Upload profile image if changed
      const profileImageUrl = await uploadProfileImage();

      // Update profile
      const response = await userApi.updateProfile({
        ...data,
        profileImageUrl,
      });

      toast.success('Profile updated successfully!');
      onUpdate(response.data.data);
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleClose = () => {
    reset();
    setSelectedFile(null);
    setPreviewUrl(user.profileImageUrl || '');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Profile"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Profile preview"
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-700">
                  {(user.displayName || user.username).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <label
              htmlFor="profile-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PhotoIcon className="h-4 w-4 mr-2" />
              Change Photo
            </label>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="sr-only"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-6">
          <Input
            {...register('username')}
            label="Username"
            placeholder="Your username"
            error={errors.username?.message}
          />

          <Input
            {...register('displayName')}
            label="Display Name"
            placeholder="Your display name"
            error={errors.displayName?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
            )}
          </div>
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
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}