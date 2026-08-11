import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import toast from 'react-hot-toast';
import {
  Bold, Italic, List, ListOrdered, Heading2, Heading3, Undo, Redo,
  Image as ImageIcon, Library, Loader2,
} from 'lucide-react';
import { useUploadMediaMutation } from '../../services/api';
import { MediaPicker } from './MediaPicker';

interface MenuBarProps {
  editor: any;
  onUploadClick: () => void;
  onLibraryClick: () => void;
  isUploading: boolean;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, onUploadClick, onLibraryClick, isUploading }) => {
  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-2 rounded hover:bg-gray-200 ${active ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`;

  return (
    // Sticky so the formatting buttons stay reachable while writing a long
    // body. `top-24` (96px) clears the admin layout's own sticky header
    // (~89px tall, z-40); the lower z-index here keeps the toolbar tucked
    // under that header rather than over it. The opaque background matters —
    // content scrolls underneath this strip.
    <div className="sticky top-24 z-20 flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Bold"><Bold className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Italic"><Italic className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))} title="Heading 2"><Heading2 className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))} title="Heading 3"><Heading3 className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Bullet list"><List className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Numbered list"><ListOrdered className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button
        type="button"
        onClick={onUploadClick}
        disabled={isUploading}
        className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
        title="Insert image from your computer"
      >
        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={onLibraryClick}
        disabled={isUploading}
        className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"
        title="Insert image from the media library"
      >
        <Library className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50" title="Undo"><Undo className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50" title="Redo"><Redo className="w-4 h-4" /></button>
    </div>
  );
};

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  minHeight?: string;
  dir?: 'ltr' | 'rtl';
}

/** Accepted by the file picker and validated server-side as well. */
const ACCEPTED_TYPES = 'image/jpeg,image/png,image/gif,image/webp';
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  disabled = false,
  minHeight = '150px',
  dir = 'ltr',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();

  const editor = useEditor({
    extensions: [
      StarterKit,
      // Block-level (not inline) so an image sits between paragraphs rather
      // than inside one. max-w-full keeps a large photo from breaking the
      // editor's width; the public pages apply the same constraint.
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: 'rounded-lg max-w-full h-auto' },
      }),
    ],
    content: content || '',
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  const insertImage = (url: string) => {
    editor?.chain().focus().setImage({ src: url }).run();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset immediately so picking the same file twice in a row still fires.
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('Image is larger than 4MB. Please choose a smaller file.');
      return;
    }

    try {
      const result = await uploadMedia(file).unwrap();
      insertImage(result.url);
    } catch (err: any) {
      const message = err?.data?.errors?.image?.[0] ?? err?.data?.message ?? 'Failed to upload image';
      toast.error(message);
    }
  };

  return (
    // No `overflow-hidden` here: it would make this element the sticky
    // containing block and silently stop the toolbar from sticking. The
    // corners are rounded on the toolbar and content instead.
    <div className="border border-gray-300 rounded-lg">
      {!disabled && (
        <MenuBar
          editor={editor}
          onUploadClick={() => fileInputRef.current?.click()}
          onLibraryClick={() => setIsLibraryOpen(true)}
          isUploading={isUploading}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileSelected}
        className="hidden"
      />

      <div dir={dir}>
        <EditorContent
          editor={editor}
          className={`prose max-w-none p-4 focus:outline-none rounded-b-lg ${dir === 'rtl' ? 'text-right' : ''} ${disabled ? 'bg-gray-100' : ''}`}
          style={{ minHeight }}
        />
      </div>

      <MediaPicker
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={(item) => insertImage(item.url)}
      />
    </div>
  );
};

export default RichTextEditor;
