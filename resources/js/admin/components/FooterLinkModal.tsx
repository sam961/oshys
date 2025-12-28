import React, { useState, useEffect } from 'react';
import { X, Loader2, Bold, Italic, List, ListOrdered, Heading2, Undo, Redo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateFooterLinkMutation, useUpdateFooterLinkMutation } from '../../services/api';
import type { FooterLink } from '../../types';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TranslatableField from './TranslatableField';

interface FooterLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  footerLink?: FooterLink | null;
  mode: 'create' | 'edit' | 'view';
}

// Tiptap Menu Bar Component
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('bold') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('italic') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-primary-600' : 'text-gray-600'
        }`}
        title="Heading"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('bulletList') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 transition-colors ${
          editor.isActive('orderedList') ? 'bg-gray-200 text-primary-600' : 'text-gray-600'
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-50"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

export const FooterLinkModal: React.FC<FooterLinkModalProps> = ({ isOpen, onClose, footerLink, mode }) => {
  const [createFooterLink, { isLoading: isCreating }] = useCreateFooterLinkMutation();
  const [updateFooterLink, { isLoading: isUpdating }] = useUpdateFooterLinkMutation();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    display_order: 0,
    is_active: true,
    open_in_new_tab: false,
    title_translations: { ar: '' },
    content_translations: { ar: '' },
  });

  const [contentLanguage, setContentLanguage] = useState<'en' | 'ar'>('en');

  const isViewMode = mode === 'view';

  // English content editor
  const editorEn = useEditor({
    extensions: [StarterKit],
    content: formData.content || '',
    editable: !isViewMode,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
    },
  });

  // Arabic content editor
  const editorAr = useEditor({
    extensions: [StarterKit],
    content: formData.content_translations.ar || '',
    editable: !isViewMode,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content_translations: { ...prev.content_translations, ar: editor.getHTML() } }));
    },
  });

  // Get active editor based on selected language
  const activeEditor = contentLanguage === 'en' ? editorEn : editorAr;

  useEffect(() => {
    if (footerLink && mode !== 'create') {
      setFormData({
        title: footerLink.title,
        content: footerLink.content || '',
        display_order: footerLink.display_order,
        is_active: footerLink.is_active,
        open_in_new_tab: footerLink.open_in_new_tab,
        title_translations: (footerLink as any).title_translations || { ar: '' },
        content_translations: (footerLink as any).content_translations || { ar: '' },
      });
      if (editorEn) {
        editorEn.commands.setContent(footerLink.content || '');
      }
      if (editorAr) {
        editorAr.commands.setContent((footerLink as any).content_translations?.ar || '');
      }
    } else if (mode === 'create') {
      setFormData({
        title: '',
        content: '',
        display_order: 0,
        is_active: true,
        open_in_new_tab: false,
        title_translations: { ar: '' },
        content_translations: { ar: '' },
      });
      if (editorEn) {
        editorEn.commands.setContent('');
      }
      if (editorAr) {
        editorAr.commands.setContent('');
      }
    }
  }, [footerLink, mode, editorEn, editorAr]);

  // Update editor editable state when mode changes
  useEffect(() => {
    if (editorEn) {
      editorEn.setEditable(!isViewMode);
    }
    if (editorAr) {
      editorAr.setEditable(!isViewMode);
    }
  }, [isViewMode, editorEn, editorAr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'view') {
      onClose();
      return;
    }

    try {
      const submitData = {
        ...formData,
        title_translations: JSON.stringify(formData.title_translations),
        content_translations: JSON.stringify(formData.content_translations),
      };

      if (mode === 'create') {
        await createFooterLink(submitData).unwrap();
        toast.success('Footer page created successfully');
      } else {
        await updateFooterLink({ id: footerLink!.id, data: submitData }).unwrap();
        toast.success('Footer page updated successfully');
      }
      onClose();
    } catch (error: any) {
      console.error(`${mode} error:`, error);

      if (error?.data?.errors) {
        const errors = Object.values(error.data.errors).flat();
        errors.forEach((err: any) => toast.error(err));
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error(`Failed to ${mode} footer page`);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

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
                  {mode === 'create' ? 'Add Footer Page' : mode === 'edit' ? 'Edit Footer Page' : 'Footer Page Details'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Title with TranslatableField */}
                <div>
                  <TranslatableField
                    label="Page Title"
                    name="title"
                    value={formData.title}
                    translationValue={formData.title_translations.ar}
                    onChangeEnglish={(value) => setFormData(prev => ({ ...prev, title: value }))}
                    onChangeArabic={(value) => setFormData(prev => ({ ...prev, title_translations: { ...prev.title_translations, ar: value } }))}
                    required
                    placeholder="e.g. Privacy Policy, Terms and Conditions"
                    placeholderAr="مثال: سياسة الخصوصية، الشروط والأحكام"
                    disabled={isViewMode}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The URL will be auto-generated as /pages/privacy-policy based on the title
                  </p>
                </div>

                {/* Content - Rich Text Editor with Language Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Page Content
                    </label>
                    {/* Language Toggle for Content */}
                    <div className="flex items-center gap-1">
                      <div className="flex bg-gray-100 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => setContentLanguage('en')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                            contentLanguage === 'en'
                              ? 'bg-white text-primary-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          EN
                        </button>
                        <button
                          type="button"
                          onClick={() => setContentLanguage('ar')}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                            contentLanguage === 'ar'
                              ? 'bg-white text-primary-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          AR
                        </button>
                      </div>
                      {/* Status indicators */}
                      <div className="flex items-center gap-1 ml-2">
                        <span className={`w-2 h-2 rounded-full ${formData.content ? 'bg-green-500' : 'bg-gray-300'}`} title="English content" />
                        <span className={`w-2 h-2 rounded-full ${formData.content_translations.ar ? 'bg-green-500' : 'bg-gray-300'}`} title="Arabic content" />
                      </div>
                    </div>
                  </div>
                  <div className={`border border-gray-300 rounded-lg overflow-hidden ${isViewMode ? 'bg-gray-100' : ''}`}>
                    {!isViewMode && <MenuBar editor={activeEditor} />}
                    {/* English Editor */}
                    <div className={contentLanguage === 'en' ? '' : 'hidden'}>
                      <EditorContent
                        editor={editorEn}
                        className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
                      />
                    </div>
                    {/* Arabic Editor */}
                    <div className={contentLanguage === 'ar' ? '' : 'hidden'} dir="rtl">
                      <EditorContent
                        editor={editorAr}
                        className="prose max-w-none p-4 min-h-[200px] focus:outline-none text-right"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the page content that will be displayed when users click the link
                  </p>
                </div>

                {/* Display Order */}
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
                  <p className="mt-1 text-xs text-gray-500">
                    Lower numbers appear first in the footer
                  </p>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Active (visible in footer)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="open_in_new_tab"
                      checked={formData.open_in_new_tab}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Open in new tab</span>
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
                      {mode === 'create' ? 'Create Page' : 'Update Page'}
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
