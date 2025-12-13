import React, { useState, useEffect } from 'react';
import { X, Loader2, Bold, Italic, List, ListOrdered, Heading2, Undo, Redo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateFooterLinkMutation, useUpdateFooterLinkMutation } from '../../services/api';
import type { FooterLink } from '../../types';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

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
  });

  const isViewMode = mode === 'view';

  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.content || '',
    editable: !isViewMode,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
    },
  });

  useEffect(() => {
    if (footerLink && mode !== 'create') {
      setFormData({
        title: footerLink.title,
        content: footerLink.content || '',
        display_order: footerLink.display_order,
        is_active: footerLink.is_active,
        open_in_new_tab: footerLink.open_in_new_tab,
      });
      if (editor) {
        editor.commands.setContent(footerLink.content || '');
      }
    } else if (mode === 'create') {
      setFormData({
        title: '',
        content: '',
        display_order: 0,
        is_active: true,
        open_in_new_tab: false,
      });
      if (editor) {
        editor.commands.setContent('');
      }
    }
  }, [footerLink, mode, editor]);

  // Update editor editable state when mode changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isViewMode);
    }
  }, [isViewMode, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'view') {
      onClose();
      return;
    }

    try {
      if (mode === 'create') {
        await createFooterLink(formData).unwrap();
        toast.success('Footer page created successfully');
      } else {
        await updateFooterLink({ id: footerLink!.id, data: formData }).unwrap();
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
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isViewMode}
                    required
                    placeholder="e.g. Privacy Policy, Terms and Conditions"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The URL will be auto-generated as /pages/privacy-policy based on the title
                  </p>
                </div>

                {/* Content - Rich Text Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Content
                  </label>
                  <div className={`border border-gray-300 rounded-lg overflow-hidden ${isViewMode ? 'bg-gray-100' : ''}`}>
                    {!isViewMode && <MenuBar editor={editor} />}
                    <EditorContent
                      editor={editor}
                      className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
                    />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
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
