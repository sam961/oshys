import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FormSection } from '../components/FormSection';
import TranslatableField from '../components/TranslatableField';
import TranslatableRichText from '../components/TranslatableRichText';
import { ImageUploadWithCrop, IMAGE_GUIDELINES } from '../components/ImageUploadWithCrop';
import { useGetBlogPostQuery, useGetCategoriesQuery, useCreateBlogPostMutation, useUpdateBlogPostMutation } from '../../services/api';
import toast from 'react-hot-toast';

interface FormData {
  title: string;
  excerpt: string;
  content: string;
  category_id: number | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string;
  title_translations: { ar: string };
  excerpt_translations: { ar: string };
  content_translations: { ar: string };
}

const initialFormData: FormData = {
  title: '',
  excerpt: '',
  content: '',
  category_id: null,
  is_published: false,
  is_featured: false,
  published_at: '',
  title_translations: { ar: '' },
  excerpt_translations: { ar: '' },
  content_translations: { ar: '' },
};

export const BlogEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: blogPost, isLoading: isLoadingPost, error: postError } = useGetBlogPostQuery(Number(id), { skip: !isEditMode });
  const { data: categories = [] } = useGetCategoriesQuery({ active: true, type: 'blog' });
  const [createBlogPost, { isLoading: isCreating }] = useCreateBlogPostMutation();
  const [updateBlogPost, { isLoading: isUpdating }] = useUpdateBlogPostMutation();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState<FormData>(initialFormData);

  useEffect(() => {
    if (blogPost && isEditMode) {
      const loadedData: FormData = {
        title: blogPost.title,
        excerpt: blogPost.excerpt,
        content: blogPost.content,
        category_id: blogPost.category_id || null,
        is_published: blogPost.is_published,
        is_featured: blogPost.is_featured,
        published_at: blogPost.published_at ? blogPost.published_at.split('T')[0] : '',
        title_translations: (blogPost as any).title_translations || { ar: '' },
        excerpt_translations: (blogPost as any).excerpt_translations || { ar: '' },
        content_translations: (blogPost as any).content_translations || { ar: '' },
      };
      setFormData(loadedData);
      setInitialData(loadedData);
      if ((blogPost as any).image_url) setImagePreview((blogPost as any).image_url);
    }
  }, [blogPost, isEditMode]);

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
    navigate('/admin/blog');
  }, [isDirty, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('content', formData.content);
      submitData.append('is_published', formData.is_published ? '1' : '0');
      submitData.append('is_featured', formData.is_featured ? '1' : '0');
      submitData.append('author_id', '1');
      if (formData.category_id) submitData.append('category_id', formData.category_id.toString());
      if (formData.published_at) submitData.append('published_at', formData.published_at);
      if (imageFile) submitData.append('image', imageFile);
      submitData.append('title_translations', JSON.stringify(formData.title_translations));
      submitData.append('excerpt_translations', JSON.stringify(formData.excerpt_translations));
      submitData.append('content_translations', JSON.stringify(formData.content_translations));

      if (isEditMode) {
        submitData.append('_method', 'PUT');
        await updateBlogPost({ id: Number(id), data: submitData }).unwrap();
        toast.success('Blog post updated successfully');
      } else {
        await createBlogPost(submitData).unwrap();
        toast.success('Blog post created successfully');
      }
      navigate('/admin/blog');
    } catch (error: any) {
      if (error?.data?.errors) Object.values(error.data.errors).flat().forEach((err: any) => toast.error(err));
      else toast.error(`Failed to ${isEditMode ? 'update' : 'create'} blog post`);
    }
  };

  const isLoading = isCreating || isUpdating;

  if (isEditMode && isLoadingPost) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (isEditMode && postError) return <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg"><h3 className="font-semibold mb-2">Blog post not found</h3><button onClick={() => navigate('/admin/blog')} className="mt-4 text-red-700 underline">Return to Blog</button></div>;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Blog', href: '/admin/blog' }, { label: isEditMode ? 'Edit Post' : 'New Post' }]} />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Blog Post' : 'Add New Blog Post'}</h1>{isEditMode && blogPost && <p className="text-gray-500 text-sm mt-1">Editing: {blogPost.title}</p>}</div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBack} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg font-medium disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{isEditMode ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormSection title="Content" description="Title, excerpt, and content">
            <div className="space-y-5">
              <TranslatableField label="Title" name="title" value={formData.title} translationValue={formData.title_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, title: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, title_translations: { ar: v } }))} required placeholder="Enter blog post title" placeholderAr="أدخل عنوان المقال" />
              <TranslatableRichText label="Excerpt" name="excerpt" value={formData.excerpt} translationValue={formData.excerpt_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, excerpt: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, excerpt_translations: { ar: v } }))} required />
              <TranslatableRichText label="Content" name="content" value={formData.content} translationValue={formData.content_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, content: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, content_translations: { ar: v } }))} required minHeight="250px" />
            </div>
          </FormSection>

          <div className="space-y-6">
            <FormSection title="Settings" description="Category and publish date">
              <div className="space-y-5">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Category</label><select value={formData.category_id || ''} onChange={(e) => setFormData(p => ({ ...p, category_id: e.target.value === '' ? null : Number(e.target.value) }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"><option value="">No Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Published Date</label><input type="date" value={formData.published_at} onChange={(e) => setFormData(p => ({ ...p, published_at: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              </div>
            </FormSection>

            <FormSection title="Featured Image" description="Upload blog image">
              <ImageUploadWithCrop onImageCropped={(f, u) => { setImageFile(f); setImagePreview(u); }} currentPreview={imagePreview} guideline={IMAGE_GUIDELINES.blog} />
            </FormSection>

            <FormSection title="Status" description="Publish and feature settings">
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"><input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData(p => ({ ...p, is_published: e.target.checked }))} className="w-5 h-5 text-primary-600 border-gray-300 rounded" /><div><span className="text-sm font-medium text-gray-900 block">Published</span><span className="text-xs text-gray-500">Post is visible on the website</span></div></label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData(p => ({ ...p, is_featured: e.target.checked }))} className="w-5 h-5 text-primary-600 border-gray-300 rounded" /><div><span className="text-sm font-medium text-gray-900 block">Featured</span><span className="text-xs text-gray-500">Show in featured posts section</span></div></label>
              </div>
            </FormSection>
          </div>
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 z-50"><button type="button" onClick={handleBack} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">Cancel</button><button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-medium disabled:opacity-50">{isLoading && <Loader2 className="w-4 h-4 animate-spin" />}{isEditMode ? 'Save' : 'Create'}</button></div>
        <div className="lg:hidden h-24" />
      </form>
    </div>
  );
};
