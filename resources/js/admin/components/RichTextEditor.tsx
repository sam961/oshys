import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Undo, Redo } from 'lucide-react';

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-2 rounded hover:bg-gray-200 ${active ? 'bg-gray-200 text-primary-600' : 'text-gray-600'}`;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))}><Bold className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))}><Italic className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))}><Heading2 className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))}><Heading3 className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))}><List className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))}><ListOrdered className="w-4 h-4" /></button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"><Undo className="w-4 h-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-2 rounded hover:bg-gray-200 text-gray-600 disabled:opacity-50"><Redo className="w-4 h-4" /></button>
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

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  disabled = false,
  minHeight = '150px',
  dir = 'ltr',
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
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

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {!disabled && <MenuBar editor={editor} />}
      <div dir={dir}>
        <EditorContent
          editor={editor}
          className={`prose max-w-none p-4 focus:outline-none ${dir === 'rtl' ? 'text-right' : ''} ${disabled ? 'bg-gray-100' : ''}`}
          style={{ minHeight }}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
