import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateTeamMemberMutation, useUpdateTeamMemberMutation } from '../../services/api';
import type { TeamMember } from '../../types';
import toast from 'react-hot-toast';
import { ImageUploadWithCrop, IMAGE_GUIDELINES } from './ImageUploadWithCrop';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMember?: TeamMember | null;
  mode: 'create' | 'edit' | 'view';
}

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ isOpen, onClose, teamMember, mode }) => {
  const [createTeamMember, { isLoading: isCreating }] = useCreateTeamMemberMutation();
  const [updateTeamMember, { isLoading: isUpdating }] = useUpdateTeamMemberMutation();

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    image: '',
    email: '',
    phone: '',
    experience: '',
    certifications: [] as string[],
    social_links: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
    },
    is_active: true,
    display_order: 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (teamMember && mode !== 'create') {
      setFormData({
        name: teamMember.name,
        role: teamMember.role,
        bio: teamMember.bio || '',
        image: teamMember.image || '',
        email: teamMember.email || '',
        phone: teamMember.phone || '',
        experience: teamMember.experience || '',
        certifications: teamMember.certifications || [],
        social_links: teamMember.social_links || {
          facebook: '',
          instagram: '',
          twitter: '',
          linkedin: '',
        },
        is_active: teamMember.is_active,
        display_order: teamMember.display_order,
      });
      // Set image preview from existing team member
      if ((teamMember as any).image_url) {
        setImagePreview((teamMember as any).image_url);
      }
      setImageFile(null);
    } else if (mode === 'create') {
      setFormData({
        name: '',
        role: '',
        bio: '',
        image: '',
        email: '',
        phone: '',
        experience: '',
        certifications: [],
        social_links: {
          facebook: '',
          instagram: '',
          twitter: '',
          linkedin: '',
        },
        is_active: true,
        display_order: 0,
      });
      setImageFile(null);
      setImagePreview('');
    }
  }, [teamMember, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'view') {
      onClose();
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Add all form fields to FormData
      submitData.append('name', formData.name);
      submitData.append('role', formData.role);
      submitData.append('bio', formData.bio);
      submitData.append('is_active', formData.is_active ? '1' : '0');
      submitData.append('display_order', formData.display_order.toString());

      if (formData.email) {
        submitData.append('email', formData.email);
      }
      if (formData.phone) {
        submitData.append('phone', formData.phone);
      }
      if (formData.experience) {
        submitData.append('experience', formData.experience);
      }

      // Add certifications as JSON
      if (formData.certifications.length > 0) {
        submitData.append('certifications', JSON.stringify(formData.certifications));
      }

      // Add social links as JSON
      submitData.append('social_links', JSON.stringify(formData.social_links));

      // Add image file if selected
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (mode === 'create') {
        await createTeamMember(submitData).unwrap();
        toast.success('Team member created successfully');
      } else {
        // For update with FormData, we need to use POST with _method spoofing
        submitData.append('_method', 'PUT');
        await updateTeamMember({ id: teamMember!.id, data: submitData }).unwrap();
        toast.success('Team member updated successfully');
      }
      onClose();
    } catch (error: any) {
      console.error(`${mode} error:`, error);

      // Show specific validation errors if available
      if (error?.data?.errors) {
        const errors = Object.values(error.data.errors).flat();
        errors.forEach((err: any) => toast.error(err));
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error(`Failed to ${mode} team member`);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else if (name.startsWith('social_')) {
      const socialKey = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [socialKey]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageCropped = (file: File, previewUrl: string) => {
    setImageFile(file);
    setImagePreview(previewUrl);
  };

  const isViewMode = mode === 'view';
  const isLoading = isCreating || isUpdating;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'create' ? 'Add Team Member' : mode === 'edit' ? 'Edit Team Member' : 'Team Member Details'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name and Role */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isViewMode}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={isViewMode}
                      required
                      placeholder="e.g. Lead Instructor"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={isViewMode}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Experience and Display Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      disabled={isViewMode}
                      placeholder="e.g. 10+ years"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="display_order"
                      value={formData.display_order}
                      onChange={handleChange}
                      disabled={isViewMode}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Image Upload with Crop */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image
                  </label>
                  {isViewMode ? (
                    <div className="mt-3">
                      <img
                        src={imagePreview || '/placeholder.svg'}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  ) : (
                    <ImageUploadWithCrop
                      onImageCropped={handleImageCropped}
                      currentPreview={imagePreview}
                      guideline={IMAGE_GUIDELINES.teamMember}
                      disabled={isViewMode}
                      aspectRatio={1}
                    />
                  )}
                </div>

                {/* Social Links */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Media Links
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="url"
                      name="social_facebook"
                      value={formData.social_links.facebook}
                      onChange={handleChange}
                      disabled={isViewMode}
                      placeholder="Facebook URL"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                    <input
                      type="url"
                      name="social_instagram"
                      value={formData.social_links.instagram}
                      onChange={handleChange}
                      disabled={isViewMode}
                      placeholder="Instagram URL"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                    <input
                      type="url"
                      name="social_twitter"
                      value={formData.social_links.twitter}
                      onChange={handleChange}
                      disabled={isViewMode}
                      placeholder="Twitter URL"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                    <input
                      type="url"
                      name="social_linkedin"
                      value={formData.social_links.linkedin}
                      onChange={handleChange}
                      disabled={isViewMode}
                      placeholder="LinkedIn URL"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Active Checkbox */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {isViewMode ? 'Close' : 'Cancel'}
                  </button>
                  {!isViewMode && (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {mode === 'create' ? 'Create Member' : 'Update Member'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
