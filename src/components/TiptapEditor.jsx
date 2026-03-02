import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

const TiptapEditor = ({ value, onChange, placeholder }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: placeholder || "Tulis sesuatu...",
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: "focus:outline-none min-h-[40px] prose prose-sm max-w-none text-slate-700",
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            // Hanya kirim ke parent jika konten berubah untuk menghindari loop
            onChange(html === "<p></p>" ? "" : html);
        },
    });

    // Sinkronisasi dari state luar ke dalam editor (hanya jika diperlukan)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "");
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="w-full border-b-2 border-slate-200 focus-within:border-secondary transition-all py-1">
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;