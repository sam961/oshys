import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FormSection } from '../components/FormSection';
import { ImageUploadWithCrop, IMAGE_GUIDELINES } from '../components/ImageUploadWithCrop';
import { useGetTeamMemberQuery, useCreateTeamMemberMutation, useUpdateTeamMemberMutation } from '../../services/api';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  role: string;
  bio: string;
  email: string;
  phone: string;
  experience: string;
  is_active: boolean;
  display_order: number;
  social_links: { facebook: string; instagram: string; twitter: string; linkedin: string };
}

const initialFormData: FormData = {
  name: '',
  role: '',
  bio: '',
  email: '',
  phone: '',
  experience: '',
  is_active: true,
  display_order: 0,
  social_links: { facebook: '', instagram: '', twitter: '', linkedin: '' },
};

export const TeamMemberEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: teamMember, isLoading: isLoadingMember, error: memberError } = useGetTeamMemberQuery(Number(id), { skip: !isEditMode });
  const [createTeamMember, { isLoading: isCreating }] = useCreateTeamMemberMutation();
  const [updateTeamMember, { isLoading: isUpdating }] = useUpdateTeamMemberMutation();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState<FormData>(initialFormData);

  useEffect(() => {
    if (teamMember && isEditMode) {
      const loadedData: FormData = {
        name: teamMember.name,
        role: teamMember.role,
        bio: teamMember.bio || '',
        email: teamMember.email || '',
        phone: teamMember.phone || '',
        experience: teamMember.experience || '',
        is_active: teamMember.is_active,
        display_order: teamMember.display_order,
        social_links: teamMember.social_links || { facebook: '', instagram: '', twitter: '', linkedin: '' },
      };
      setFormData(loadedData);
      setInitialData(loadedData);
      if ((teamMember as any).image_url) setImagePreview((teamMember as any).image_url);
    }
  }, [teamMember, isEditMode]);

  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData) || imageFile !== null);
  }, [formData, initialData, imageFile]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBack = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    navigate('/admin/team');
  }, [isDirty, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('role', formData.role);
      submitData.append('bio', formData.bio);
      submitData.append('is_active', formData.is_active ? '1' : '0');
      submitData.append('display_order', formData.display_order.toString());
      if (formData.email) submitData.append('email', formData.email);
      if (formData.phone) submitData.append('phone', formData.phone);
      if (formData.experience) submitData.append('experience', formData.experience);
      submitData.append('social_links', JSON.stringify(formData.social_links));
      if (imageFile) submitData.append('image', imageFile);

      if (isEditMode) {
        submitData.append('_method', 'PUT');
        await updateTeamMember({ id: Number(id), data: submitData }).unwrap();
        toast.success('Team member updated successfully');
      } else {
        await createTeamMember(submitData).unwrap();
        toast.success('Team member created successfully');
      }
      navigate('/admin/team');
    } catch (error: any) {
      if (error?.data?.errors) Object.values(error.data.errors).flat().forEach((err: any) => toast.error(err));
      else toast.error(`Failed to ${isEditMode ? 'update' : 'create'} team member`);
    }
  };

  const isLoading = isCreating || isUpdating;

  if (isEditMode && isLoadingMember) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (isEditMode && memberError) return <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg"><h3 className="font-semibold mb-2">Team member not found</h3><button onClick={() => navigate('/admin/team')} className="mt-4 text-red-700 underline">Return to Team</button></div>;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Team', href: '/admin/team' }, { label: isEditMode ? 'Edit Member' : 'New Member' }]} />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Team Member' : 'Add Team Member'}</h1>{isEditMode && teamMember && <p className="text-gray-500 text-sm mt-1">Editing: {teamMember.name}</p>}</div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBack} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg font-medium disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{isEditMode ? 'Save Changes' : 'Create Member'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormSection title="Basic Information" description="Name, role, and bio">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label><input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Role *</label><input type="text" value={formData.role} onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))} required placeholder="e.g. Lead Instructor" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Bio</label><textarea value={formData.bio} onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone</label><input type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Experience</label><input type="text" value={formData.experience} onChange={(e) => setFormData(p => ({ ...p, experience: e.target.value }))} placeholder="e.g. 10+ years" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label><input type="number" value={formData.display_order} onChange={(e) => setFormData(p => ({ ...p, display_order: Number(e.target.value) }))} min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              </div>
            </div>
          </FormSection>

          <div className="space-y-6">
            <FormSection title="Profile Image" description="Upload member photo">
              <ImageUploadWithCrop onImageCropped={(f, u) => { setImageFile(f); setImagePreview(u); }} currentPreview={imagePreview} guideline={IMAGE_GUIDELINES.teamMember} aspectRatio={1} />
            </FormSection>

            <FormSection title="Social Links" description="Social media profiles">
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label><input type="url" value={formData.social_links.facebook} onChange={(e) => setFormData(p => ({ ...p, social_links: { ...p.social_links, facebook: e.target.value } }))} placeholder="https://facebook.com/..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label><input type="url" value={formData.social_links.instagram} onChange={(e) => setFormData(p => ({ ...p, social_links: { ...p.social_links, instagram: e.target.value } }))} placeholder="https://instagram.com/..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label><input type="url" value={formData.social_links.twitter} onChange={(e) => setFormData(p => ({ ...p, social_links: { ...p.social_links, twitter: e.target.value } }))} placeholder="https://twitter.com/..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label><input type="url" value={formData.social_links.linkedin} onChange={(e) => setFormData(p => ({ ...p, social_links: { ...p.social_links, linkedin: e.target.value } }))} placeholder="https://linkedin.com/in/..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              </div>
            </FormSection>

            <FormSection title="Status" description="Member visibility">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))} className="w-5 h-5 text-primary-600 border-gray-300 rounded" /><div><span className="text-sm font-medium text-gray-900 block">Active</span><span className="text-xs text-gray-500">Member is visible on the website</span></div></label>
            </FormSection>
          </div>
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 z-50"><button type="button" onClick={handleBack} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">Cancel</button><button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-medium disabled:opacity-50">{isLoading && <Loader2 className="w-4 h-4 animate-spin" />}{isEditMode ? 'Save' : 'Create'}</button></div>
        <div className="lg:hidden h-24" />
      </form>
    </div>
  );
};
