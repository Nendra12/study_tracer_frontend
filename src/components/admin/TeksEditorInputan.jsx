import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough as StrikethroughIcon,
    List,
    ListOrdered,
    Undo,
    Redo,
    Heading2,
    Link as LinkIcon,
    Code,
    Quote,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    Minus,
    X,
    RemoveFormatting
} from 'lucide-react';

const TeksEditorInputan = ({ content, onChange, placeholder = "Tulis di sini...", minHeight = "100px" }) => {
    const editorContainerRef = useRef(null);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Memoize extensions to prevent duplicate warnings
    const extensions = useMemo(() => [
        StarterKit.configure({
            heading: {
                levels: [2, 3],
            },
        }),
        Placeholder.configure({
            placeholder: placeholder,
        }),
        Image.configure({
            inline: true,
            allowBase64: true,
            HTMLAttributes: {
                class: 'max-w-full h-auto rounded-lg my-2',
            },
        }),
        Link.configure({
            openOnClick: false,
            HTMLAttributes: {
                class: 'text-primary underline hover:text-secondary cursor-pointer',
            },
        }),
        Underline,
        TextAlign.configure({
            types: ['heading', 'paragraph'],
        }),
        Highlight.configure({
            multicolor: false,
        }),
    ], [placeholder]);

    const editor = useEditor({
        extensions,
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onFocus: () => {
            setIsFocused(true);
        },
        onBlur: ({ event }) => {
            // Check if click is outside the editor container
            setTimeout(() => {
                const clickedElement = event?.relatedTarget;
                if (!editorContainerRef.current?.contains(clickedElement)) {
                    setIsFocused(false);
                    setShowLinkInput(false);
                }
            }, 200);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none p-3 text-slate-700',
            },
        },
    });

    // Sync content when prop changes (untuk update page)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [content, editor]);

    const addLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setShowLinkInput(false);
        }
    };

    const removeLink = () => {
        editor.chain().focus().unsetLink().run();
    };

    if (!editor) {
        return null;
    }

    return (
        <div
            ref={editorContainerRef}
            className="border border-slate-200 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all"
            onMouseDown={(e) => {
                // Keep focus when clicking toolbar
                if (e.target.closest('.toolbar-container')) {
                    e.preventDefault();
                }
            }}
        >
            {/* Toolbar - Always Visible */}
            <div
                className="toolbar-container overflow-hidden transition-all duration-300 ease-in-out border-b border-slate-200 bg-slate-50 max-h-96 opacity-100"
            >
                <div className="flex items-center gap-1 p-2 flex-wrap">{/* Text Formatting */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bold') ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('italic') ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('underline') ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Underline (Ctrl+U)"
                    >
                        <UnderlineIcon size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('strike') ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Strikethrough"
                    >
                        <StrikethroughIcon size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('code') ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Code"
                    >
                        <Code size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('highlight') ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Highlight"
                    >
                        <Highlighter size={16} />
                    </button>

                    <div className="w-px h-6 bg-slate-300 mx-1"></div>

                    {/* Headings */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Heading 2"
                    >
                        <Heading2 size={16} />
                    </button>

                    <div className="w-px h-6 bg-slate-300 mx-1"></div>

                    {/* Text Alignment */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Align Left"
                    >
                        <AlignLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Align Center"
                    >
                        <AlignCenter size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Align Right"
                    >
                        <AlignRight size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Justify"
                    >
                        <AlignJustify size={16} />
                    </button>

                    <div className="w-px h-6 bg-slate-300 mx-1"></div>

                    {/* Lists */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('bulletList') ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Bullet List"
                    >
                        <List size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('orderedList') ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Numbered List"
                    >
                        <ListOrdered size={16} />
                    </button>

                    <div className="w-px h-6 bg-slate-300 mx-1"></div>

                    {/* Insert Elements */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('blockquote') ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Quote"
                    >
                        <Quote size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        className="cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors text-slate-600"
                        title="Horizontal Line"
                    >
                        <Minus size={16} />
                    </button>

                    <div className="w-px h-6 bg-slate-300 mx-1"></div>

                    {/* Link */}
                    <button
                        type="button"
                        onClick={() => setShowLinkInput(!showLinkInput)}
                        className={`cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors ${editor.isActive('link') ? 'bg-slate-300 text-primary' : 'text-slate-600'
                            }`}
                        title="Add Link"
                    >
                        <LinkIcon size={16} />
                    </button>
                    {editor.isActive('link') && (
                        <button
                            type="button"
                            onClick={removeLink}
                            className="cursor-pointer p-2 rounded hover:bg-red-100 transition-colors text-red-600"
                            title="Remove Link"
                        >
                            <X size={14} />
                        </button>
                    )}

                    <div className="w-px h-6 bg-slate-300 mx-1"></div>

                    {/* Clear Formatting */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                        className="cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors text-slate-600"
                        title="Clear Formatting"
                    >
                        <RemoveFormatting size={16} />
                    </button>

                    <div className="w-px h-6 bg-slate-300 mx-1"></div>

                    {/* Undo/Redo */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().chain().focus().undo().run()}
                        className="cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().chain().focus().redo().run()}
                        className="cursor-pointer p-2 rounded hover:bg-slate-200 transition-colors text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo size={16} />
                    </button>
                </div>
            </div>

            {/* Link Input Dialog */}
            {showLinkInput && isFocused && (
                <div className="p-3 bg-blue-50 border-b border-blue-200 flex items-center gap-2 animate-slideDown">
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="Masukkan URL (https://...)"
                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                addLink();
                            }
                        }}
                    />
                    <button
                        type="button"
                        onClick={addLink}
                        className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-secondary transition-colors"
                    >
                        Tambah
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setShowLinkInput(false);
                            setLinkUrl('');
                        }}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        Batal
                    </button>
                </div>
            )}

            {/* Editor Content */}
            <div
                style={{ minHeight: minHeight }}
                className="bg-white relative"
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default TeksEditorInputan;
