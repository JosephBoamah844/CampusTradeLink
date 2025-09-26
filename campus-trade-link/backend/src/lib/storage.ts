import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { isValidImageType } from '@campus-trade-link/shared';

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

export interface UploadResult {
  id: string;
  url: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  bucket: string;
  path: string;
}

export const uploadFile = async (
  file: Buffer,
  originalName: string,
  mimetype: string,
  userId?: string
): Promise<UploadResult> => {
  // Validate file type
  if (!isValidImageType(mimetype)) {
    throw new Error('Invalid file type. Only images are allowed.');
  }

  // Validate file size
  if (file.length > config.MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  // Generate unique filename
  const fileExtension = originalName.split('.').pop() || '';
  const filename = `${uuidv4()}.${fileExtension}`;
  const bucket = 'uploads';
  const path = userId ? `${userId}/${filename}` : `public/${filename}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: mimetype,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Storage upload error:', error);
    throw new Error('Failed to upload file');
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return {
    id: uuidv4(),
    url: publicUrl,
    filename,
    originalName,
    mimetype,
    size: file.length,
    bucket,
    path,
  };
};

export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Storage delete error:', error);
    throw new Error('Failed to delete file');
  }
};

export const getSignedUrl = async (
  bucket: string, 
  path: string, 
  expiresIn = 3600
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }

  return data.signedUrl;
};

export const uploadMultipleFiles = async (
  files: Array<{
    file: Buffer;
    originalName: string;
    mimetype: string;
  }>,
  userId?: string
): Promise<UploadResult[]> => {
  const uploadPromises = files.map(({ file, originalName, mimetype }) =>
    uploadFile(file, originalName, mimetype, userId)
  );

  return Promise.all(uploadPromises);
};