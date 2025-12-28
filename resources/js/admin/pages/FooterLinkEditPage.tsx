import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Bold, Italic, List, ListOrdered, Heading2, Undo, Redo } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FormSection } from '../components/FormSection';
import TranslatableField from '../components/TranslatableField';
import { useGetFooterLinkQuery, useCreateFooterLinkMutation, useUpdateFooterLinkMutation } from '../../services/api';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}><Bold className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}><Italic className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}><Heading2 className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}><List className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`}><ListOrdered className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"><Undo className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"><Redo className="w-4 h-4" /></button>
    </div>
  );
};

interface FormData {
  title: string;
  content: string;
  display_order: number;
  is_active: boolean;
  open_in_new_tab: boolean;
  title_translations: { ar: string };
  content_translations: { ar: string };
}

const initialFormData: FormData = {
  title: '',
  content: '',
  display_order: 0,
  is_active: true,
  open_in_new_tab: false,
  title_translations: { ar: '' },
  content_translations: { ar: '' },
};

export const FooterLinkEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: footerLink, isLoading: isLoadingLink, error: linkError } = useGetFooterLinkQuery(Number(id), { skip: !isEditMode });
  const [createFooterLink, { isLoading: isCreating }] = useCreateFooterLinkMutation();
  const [updateFooterLink, { isLoading: isUpdating }] = useUpdateFooterLinkMutation();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [contentLanguage, setContentLanguage] = useState<'en' | 'ar'>('en');
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState<FormData>(initialFormData);

  const editorEn = useEditor({
    extensions: [StarterKit],
    content: formData.content || '',
    onUpdate: ({ editor }) => setFormData(p => ({ ...p, content: editor.getHTML() })),
  });

  const editorAr = useEditor({
    extensions: [StarterKit],
    content: formData.content_translations.ar || '',
    onUpdate: ({ editor }) => setFormData(p => ({ ...p, content_translations: { ar: editor.getHTML() } })),
  });

  const activeEditor = contentLanguage === 'en' ? editorEn : editorAr;

  useEffect(() => {
    if (footerLink && isEditMode) {
      const loadedData: FormData = {
        title: footerLink.title,
        content: footerLink.content || '',
        display_order: footerLink.display_order,
        is_active: footerLink.is_active,
        open_in_new_tab: footerLink.open_in_new_tab,
        title_translations: (footerLink as any).title_translations || { ar: '' },
        content_translations: (footerLink as any).content_translations || { ar: '' },
      };
      setFormData(loadedData);
      setInitialData(loadedData);
      if (editorEn) editorEn.commands.setContent(footerLink.content || '');
      if (editorAr) editorAr.commands.setContent((footerLink as any).content_translations?.ar || '');
    }
  }, [footerLink, isEditMode, editorEn, editorAr]);

  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
  }, [formData, initialData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBack = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    navigate('/admin/footer-links');
  }, [isDirty, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        title_translations: JSON.stringify(formData.title_translations),
        content_translations: JSON.stringify(formData.content_translations),
      };

      if (isEditMode) {
        await updateFooterLink({ id: Number(id), data: submitData }).unwrap();
        toast.success('Footer page updated successfully');
      } else {
        await createFooterLink(submitData).unwrap();
        toast.success('Footer page created successfully');
      }
      navigate('/admin/footer-links');
    } catch (error: any) {
      if (error?.data?.errors) Object.values(error.data.errors).flat().forEach((err: any) => toast.error(err));
      else toast.error(`Failed to ${isEditMode ? 'update' : 'create'} footer page`);
    }
  };

  const isLoading = isCreating || isUpdating;

  if (isEditMode && isLoadingLink) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (isEditMode && linkError) return <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg"><h3 className="font-semibold mb-2">Footer page not found</h3><button onClick={() => navigate('/admin/footer-links')} className="mt-4 text-red-700 underline">Return to Footer Links</button></div>;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Footer Links', href: '/admin/footer-links' }, { label: isEditMode ? 'Edit Page' : 'New Page' }]} />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Footer Page' : 'Add Footer Page'}</h1>{isEditMode && footerLink && <p className="text-gray-500 text-sm mt-1">Editing: {footerLink.title}</p>}</div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBack} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg font-medium disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{isEditMode ? 'Save Changes' : 'Create Page'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Page Title" description="Title displayed in footer and page header">
              <TranslatableField label="Title" name="title" value={formData.title} translationValue={formData.title_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, title: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, title_translations: { ar: v } }))} required placeholder="e.g. Privacy Policy" placeholderAr="مثال: سياسة الخصوصية" />
              <p className="mt-1 text-xs text-gray-500">The URL will be auto-generated based on the title</p>
            </FormSection>

            <FormSection title="Page Content" description="Rich text content for this page">
              <div className="flex items-center justify-between mb-2">
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button type="button" onClick={() => setContentLanguage('en')} className={`px-3 py-1 text-xs font-medium rounded-md ${contentLanguage === 'en' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>EN</button>
                  <button type="button" onClick={() => setContentLanguage('ar')} className={`px-3 py-1 text-xs font-medium rounded-md ${contentLanguage === 'ar' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>AR</button>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${formData.content ? 'bg-green-500' : 'bg-gray-300'}`} title="English" />
                  <span className={`w-2 h-2 rounded-full ${formData.content_translations.ar ? 'bg-green-500' : 'bg-gray-300'}`} title="Arabic" />
                </div>
              </div>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <MenuBar editor={activeEditor} />
                <div className={contentLanguage === 'en' ? '' : 'hidden'}><EditorContent editor={editorEn} className="prose max-w-none p-4 min-h-[300px] focus:outline-none" /></div>
                <div className={contentLanguage === 'ar' ? '' : 'hidden'} dir="rtl"><EditorContent editor={editorAr} className="prose max-w-none p-4 min-h-[300px] focus:outline-none text-right" /></div>
              </div>
            </FormSection>
          </div>

          <div className="space-y-6">
            <FormSection title="Settings" description="Display order and visibility">
              <div className="space-y-5">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label><input type="number" value={formData.display_order} onChange={(e) => setFormData(p => ({ ...p, display_order: Number(e.target.value) }))} min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /><p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p></div>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))} className="w-5 h-5 text-primary-600 border-gray-300 rounded" /><div><span className="text-sm font-medium text-gray-900 block">Active</span><span className="text-xs text-gray-500">Visible in footer</span></div></label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"><input type="checkbox" checked={formData.open_in_new_tab} onChange={(e) => setFormData(p => ({ ...p, open_in_new_tab: e.target.checked }))} className="w-5 h-5 text-primary-600 border-gray-300 rounded" /><div><span className="text-sm font-medium text-gray-900 block">Open in new tab</span><span className="text-xs text-gray-500">Opens link in new browser tab</span></div></label>
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
