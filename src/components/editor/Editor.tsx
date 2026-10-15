'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import type { EditorView } from '@tiptap/pm/view';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type,
  Highlighter,
  ChevronDown,
  Undo2,
  Redo2,
  Minus,
  RemoveFormatting,
  Check,
} from 'lucide-react';
import { useCallback, useState, useRef, useEffect, type ReactNode } from 'react';
import { SketchPicker } from 'react-color';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  /** Called when an image upload fails */
  onError?: (message: string) => void;
}

const MOD = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

function ToolButton({ active, onClick, title, children, disabled }: { active?: boolean; onClick: () => void; title: string; children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      className={`p-2 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'bg-[#FF6F61]/10 text-[#e25d50]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  );
}

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1" />;

/**
 * Swap each finished blob: preview for its uploaded URL (null = upload failed, drop the image).
 * Runs after every change too, so undo/redo can never bring a stale preview back.
 * Returns true when it dispatched a fix.
 */
function resolvePreviews(view: EditorView, resolved: Map<string, string | null>): boolean {
  let tr = view.state.tr;
  const drops: { from: number; to: number }[] = [];
  view.state.doc.descendants((node, pos) => {
    if (node.type.name !== 'image' || !resolved.has(node.attrs.src)) return;
    const url = resolved.get(node.attrs.src);
    if (url) tr = tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: url });
    else drops.push({ from: pos, to: pos + node.nodeSize });
  });
  for (const d of drops.reverse()) tr = tr.delete(d.from, d.to);
  if (!tr.docChanged) return false;
  view.dispatch(tr.setMeta('addToHistory', false));
  return true;
}

export default function Editor({ content, onChange, onImageUpload, onError }: EditorProps) {
  const { t } = useLanguage();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const linkOpenRef = useRef(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const bgColorPickerRef = useRef<HTMLDivElement>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  // editorProps handlers are bound once; read the latest callbacks through refs
  const uploadRef = useRef(onImageUpload);
  const errorRef = useRef(onError);
  const resolvedRef = useRef(new Map<string, string | null>());
  useEffect(() => {
    uploadRef.current = onImageUpload;
    errorRef.current = onError;
  });

  // previews stay valid for undo/redo until the editor goes away
  useEffect(() => {
    const resolved = resolvedRef.current;
    return () => resolved.forEach((_, blob) => URL.revokeObjectURL(blob));
  }, []);

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (bgColorPickerRef.current && !bgColorPickerRef.current.contains(event.target as Node)) {
        setShowBgColorPicker(false);
      }
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setShowFontDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** Shows the image at once from a local preview, then swaps in the uploaded URL. */
  const insertImages = useCallback((view: EditorView, files: File[], pos?: number) => {
    const upload = uploadRef.current;
    if (!upload) return;
    for (const file of files) {
      const preview = URL.createObjectURL(file);
      const node = view.state.schema.nodes.image.create({ src: preview });
      const tr = pos == null ? view.state.tr.replaceSelectionWith(node) : view.state.tr.insert(pos, node);
      view.dispatch(tr);
      upload(file)
        .then((url) => {
          resolvedRef.current.set(preview, url);
          resolvePreviews(view, resolvedRef.current);
        })
        .catch((err) => {
          resolvedRef.current.set(preview, null);
          resolvePreviews(view, resolvedRef.current);
          errorRef.current?.(`${t('editor.uploadFailed')}: ${err instanceof Error ? err.message : String(err)}`);
        });
    }
  }, [t]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: t('editor.placeholder') || '从这里开始书写你的东方智慧...',
      }),
      Image.configure({
        allowBase64: true,
        inline: false,
        HTMLAttributes: {
          class: 'rounded-2xl shadow-lg my-8 max-w-full h-auto mx-auto border border-gray-100 transition-all duration-500 hover:shadow-2xl',
          loading: 'lazy',
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-[#FF6F61] underline decoration-[#FF6F61]/30 hover:decoration-[#FF6F61] transition-all cursor-pointer font-bold',
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      if (resolvePreviews(editor.view, resolvedRef.current)) return; // the fix triggers its own update
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] pt-6 pb-40 text-gray-800 font-sans selection:bg-[#FF6F61]/10 selection:text-[#FF6F61]',
      },
      // 拖入图片自动上传
      handleDrop: (view, event, _slice, moved) => {
        const files = [...(event.dataTransfer?.files ?? [])].filter((f) => f.type.startsWith('image/'));
        if (moved || !files.length || !uploadRef.current) return false;
        event.preventDefault();
        insertImages(view, files, view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos);
        return true;
      },
      // 粘贴截图/图片文件自动上传；带文字的富文本粘贴照常处理
      handlePaste: (view, event) => {
        const data = event.clipboardData;
        const files = [...(data?.files ?? [])].filter((f) => f.type.startsWith('image/'));
        if (!files.length || !uploadRef.current) return false;
        const html = data?.getData('text/html') ?? '';
        const hasText = html ? !!new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() : !!data?.getData('text/plain').trim();
        if (hasText) return false;
        event.preventDefault();
        insertImages(view, files);
        return true;
      },
    },
  });

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = () => {
      if (editor && input.files?.length) insertImages(editor.view, [...input.files]);
    };
    input.click();
  }, [editor, insertImages]);

  const openLink = useCallback(() => {
    if (!editor) return;
    setLinkValue(editor.getAttributes('link').href || '');
    linkOpenRef.current = true;
    setLinkOpen(true);
  }, [editor]);

  const closeLink = useCallback(() => {
    linkOpenRef.current = false;
    setLinkOpen(false);
  }, []);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const url = linkValue.trim();
    const chain = editor.chain().focus().extendMarkRange('link');
    if (!url) chain.unsetLink().run();
    else chain.setLink({ href: /^(https?:|mailto:|\/|#)/i.test(url) ? url : `https://${url}` }).run();
    closeLink();
  }, [editor, linkValue, closeLink]);

  // 工具栏的链接按钮：有选区时在气泡菜单里编辑，否则插入以网址为文字的链接
  const toolbarLink = useCallback(() => {
    if (!editor) return;
    if (!editor.state.selection.empty || editor.isActive('link')) {
      openLink();
      return;
    }
    const url = window.prompt(t('editor.linkPlaceholder'))?.trim();
    if (!url) return;
    const href = /^(https?:|mailto:|\/|#)/i.test(url) ? url : `https://${url}`;
    editor.chain().focus().insertContent({ type: 'text', text: url, marks: [{ type: 'link', attrs: { href } }] }).run();
  }, [editor, openLink, t]);

  if (!editor) return null;

  const tip = (label: string, keys?: string) => (keys ? `${label} (${keys.replace('Mod', MOD)})` : label);

  return (
    <div className="relative w-full">
      {/* 选中文字时的浮动菜单 */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 100, onHidden: closeLink }}
        shouldShow={({ editor: ed, state }) => linkOpenRef.current || (!state.selection.empty && !ed.isActive('image'))}
        className="flex items-center gap-0.5 bg-white border border-gray-200 shadow-xl rounded-2xl p-1"
      >
        {linkOpen ? (
          <form
            className="flex items-center gap-1 pl-2"
            onSubmit={(e) => { e.preventDefault(); applyLink(); }}
          >
            <LinkIcon className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              autoFocus
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); closeLink(); editor.commands.focus(); } }}
              placeholder={t('editor.linkPlaceholder')}
              className="w-64 bg-transparent px-1 py-1.5 text-sm outline-none"
            />
            <ToolButton onClick={applyLink} title={t('editor.apply')}><Check className="w-4 h-4" /></ToolButton>
            {editor.isActive('link') && (
              <ToolButton onClick={() => { editor.chain().focus().extendMarkRange('link').unsetLink().run(); closeLink(); }} title={t('editor.unlink')}>
                <Unlink className="w-4 h-4" />
              </ToolButton>
            )}
          </form>
        ) : (
          <>
            <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title={tip(t('editor.bold'), 'Mod+B')}><Bold className="w-4 h-4" /></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title={tip(t('editor.italic'), 'Mod+I')}><Italic className="w-4 h-4" /></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title={tip(t('editor.underline'), 'Mod+U')}><UnderlineIcon className="w-4 h-4" /></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title={t('editor.strike')}><Strikethrough className="w-4 h-4" /></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().setColor('#FF6F61').run()} active={editor.isActive('textStyle', { color: '#FF6F61' })} title={t('editor.changeColor')}><Palette className="w-4 h-4" /></ToolButton>
            <Divider />
            <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title={t('editor.h2')}><Heading2 className="w-4 h-4" /></ToolButton>
            <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title={t('editor.quote')}><Quote className="w-4 h-4" /></ToolButton>
            <ToolButton onClick={openLink} active={editor.isActive('link')} title={tip(t('editor.link'), 'Mod+K')}><LinkIcon className="w-4 h-4" /></ToolButton>
          </>
        )}
      </BubbleMenu>

      {/* 固定工具栏：吸附在写作区顶部 */}
      <div className="sticky top-0 z-30 -mx-2 flex items-center flex-wrap gap-0.5 bg-[#faf9f6]/90 backdrop-blur-xl border-b border-gray-200/70 px-2 py-1.5">
        <ToolButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title={tip(t('editor.undo'), 'Mod+Z')}><Undo2 className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title={tip(t('editor.redo'), 'Mod+Shift+Z')}><Redo2 className="w-[18px] h-[18px]" /></ToolButton>
        <Divider />
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title={tip(t('editor.h1'), '# ')}><Heading1 className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title={tip(t('editor.h2'), '## ')}><Heading2 className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title={tip(t('editor.h3'), '### ')}><Heading3 className="w-[18px] h-[18px]" /></ToolButton>
        <Divider />
        <ToolButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title={tip(t('editor.bold'), 'Mod+B')}><Bold className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title={tip(t('editor.italic'), 'Mod+I')}><Italic className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title={tip(t('editor.underline'), 'Mod+U')}><UnderlineIcon className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title={t('editor.strike')}><Strikethrough className="w-[18px] h-[18px]" /></ToolButton>

        {/* 字体选择 */}
        <div className="relative" ref={fontDropdownRef}>
          <button
            type="button"
            onClick={() => setShowFontDropdown(!showFontDropdown)}
            className={`flex items-center gap-0.5 p-2 rounded-xl transition-colors ${editor.getAttributes('textStyle').fontFamily ? 'bg-[#FF6F61]/10 text-[#e25d50]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            title={t('editor.changeFont')}
            aria-label={t('editor.changeFont')}
          >
            <Type className="w-[18px] h-[18px]" />
            <ChevronDown className="w-3 h-3" />
          </button>
          {showFontDropdown && (
            <div className="absolute top-full left-0 mt-2 z-[60] w-48 bg-white border border-gray-100 shadow-2xl rounded-2xl p-2">
              {[
                { label: t('editor.font.default'), value: 'Inter, system-ui, sans-serif' },
                { label: t('editor.font.yahei'), value: '"Microsoft YaHei", sans-serif' },
                { label: t('editor.font.simsun'), value: 'SimSun, serif' },
                { label: t('editor.font.kaiti'), value: 'KaiTi, serif' },
                { label: t('editor.font.fangsong'), value: 'FangSong, serif' },
                { label: t('editor.font.serif'), value: 'Georgia, serif' },
                { label: t('editor.font.mono'), value: '"Courier New", monospace' },
              ].map((font) => (
                <button
                  type="button"
                  key={font.value}
                  onClick={() => {
                    editor.chain().focus().setFontFamily(font.value).run();
                    setShowFontDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-colors hover:bg-gray-50 ${editor.isActive('textStyle', { fontFamily: font.value }) ? 'text-[#FF6F61] bg-[#FF6F61]/5' : 'text-gray-600'}`}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </button>
              ))}
              <div className="border-t border-gray-100 my-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetFontFamily().run();
                    setShowFontDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 rounded-xl text-xs text-red-400 hover:bg-red-50 transition-colors"
                >
                  {t('editor.resetFont')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 文字颜色 */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`p-2 rounded-xl transition-colors ${editor.getAttributes('textStyle').color ? 'bg-gray-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            style={{ color: editor.getAttributes('textStyle').color }}
            title={t('editor.changeColor')}
            aria-label={t('editor.changeColor')}
          >
            <Palette className="w-[18px] h-[18px]" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-2 z-[60] shadow-2xl">
              <SketchPicker
                color={editor.getAttributes('textStyle').color || '#000000'}
                onChange={(color) => editor.chain().focus().setColor(color.hex).run()}
                presetColors={['#FF6F61', '#000000', '#ffffff', '#4a4a4a', '#9b9b9b', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#607d8b']}
              />
            </div>
          )}
        </div>

        {/* 背景颜色 */}
        <div className="relative" ref={bgColorPickerRef}>
          <button
            type="button"
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
            className={`p-2 rounded-xl transition-colors ${editor.isActive('highlight') ? 'bg-yellow-100 text-yellow-600' : 'text-gray-500 hover:text-yellow-600 hover:bg-gray-100'}`}
            style={{ backgroundColor: editor.getAttributes('highlight').color }}
            title={t('editor.changeBgColor')}
            aria-label={t('editor.changeBgColor')}
          >
            <Highlighter className="w-[18px] h-[18px]" />
          </button>
          {showBgColorPicker && (
            <div className="absolute top-full left-0 mt-2 z-[60] shadow-2xl">
              <SketchPicker
                color={editor.getAttributes('highlight').color || '#ffff00'}
                onChange={(color) => editor.chain().focus().setHighlight({ color: color.hex }).run()}
                presetColors={['#ffff00', '#FF6F61', '#9eff00', '#00ff73', '#00f7ff', '#0044ff', '#b300ff', '#ff006a']}
              />
            </div>
          )}
        </div>
        <ToolButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title={t('editor.clear')}><RemoveFormatting className="w-[18px] h-[18px]" /></ToolButton>
        <Divider />
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title={t('editor.alignLeft')}><AlignLeft className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title={t('editor.alignCenter')}><AlignCenter className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title={t('editor.alignRight')}><AlignRight className="w-[18px] h-[18px]" /></ToolButton>
        <Divider />
        <ToolButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title={tip(t('editor.bulletList'), '- ')}><List className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title={tip(t('editor.orderedList'), '1. ')}><ListOrdered className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title={tip(t('editor.quote'), '> ')}><Quote className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title={tip(t('editor.code'), '``` ')}><Code className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title={tip(t('editor.hr'), '---')}><Minus className="w-[18px] h-[18px]" /></ToolButton>
        <ToolButton onClick={toolbarLink} active={editor.isActive('link')} title={tip(t('editor.link'), 'Mod+K')}><LinkIcon className="w-[18px] h-[18px]" /></ToolButton>

        <button
          type="button"
          onClick={addImage}
          className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-[#e25d50] hover:bg-[#FF6F61]/10 transition-colors"
        >
          <ImageIcon className="w-[18px] h-[18px]" />
          {t('editor.insertImage')}
        </button>
      </div>

      <div
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (!editor.state.selection.empty || editor.isActive('link')) openLink();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* 正文排版与文章页保持一致 */}
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #b8b2a9;
          pointer-events: none;
          height: 0;
        }
        .tiptap {
          outline: none !important;
          position: relative;
          font-size: 17px;
          line-height: 1.85;
          color: #374151;
        }
        .tiptap p { margin: 0.9em 0; }
        .tiptap blockquote {
          border-left: 4px solid #FF6F61;
          background: #fbf7f1;
          padding: 0.6em 1.2em;
          border-radius: 0 0.75rem 0.75rem 0;
          font-style: normal;
          color: #57534e;
          margin: 1.4em 0;
        }
        .tiptap blockquote p { margin: 0.4em 0; }
        .tiptap h1 { font-size: 1.75rem; font-weight: 700; margin: 1.6em 0 0.6em; color: #111; }
        .tiptap h2 { font-size: 1.45rem; font-weight: 700; margin: 1.5em 0 0.5em; color: #1f1f1f; }
        .tiptap h3 { font-size: 1.2rem; font-weight: 700; margin: 1.3em 0 0.4em; color: #262626; }
        .tiptap hr { margin: 2em 0; border-color: #e7e2da; }
        .tiptap img { cursor: default; }
        .tiptap img[src^='blob:'] { opacity: 0.55; }
        .tiptap img.ProseMirror-selectednode {
          outline: 3px solid #FF6F61;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
