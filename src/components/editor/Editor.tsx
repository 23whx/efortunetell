'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
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
  Image as ImageIcon,
  Heading1,
  Heading2,
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
  ChevronDown
} from 'lucide-react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { deleteArticleImageByUrl } from '@/lib/supabase/article-images';
import { useLanguage } from '@/contexts/LanguageContext';

interface EditorProps {
  content: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function Editor({ content, onChange, onImageUpload }: EditorProps) {
  const { t } = useLanguage();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const bgColorPickerRef = useRef<HTMLDivElement>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  // 用于追踪编辑器中的图片 URL，实现自动清理
  const prevImagesRef = useRef<Set<string>>(new Set());

  // 从 HTML 中提取所有图片 URL 的辅助函数
  const extractImageUrls = (html: string) => {
    const urls = new Set<string>();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('http')) {
        urls.add(src);
      }
    });
    return urls;
  };

  // 初始化追踪器
  useEffect(() => {
    if (content) {
      prevImagesRef.current = extractImageUrls(content);
    }
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

  const editor = useEditor({
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
      const html = editor.getHTML();
      onChange(html);

      // 自动清理被删除的图片
      const currentImages = extractImageUrls(html);
      
      // 找出在旧列表中但不在新列表中的图片
      prevImagesRef.current.forEach(url => {
        if (!currentImages.has(url)) {
          // 图片被删除了，执行云端清理
          console.log('🔍 检测到图片被移除，准备清理云端数据:', url);
          deleteArticleImageByUrl(url).catch(err => {
            console.error('自动删除图片失败:', err);
          });
        }
      });

      // 更新追踪器
      prevImagesRef.current = currentImages;
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] py-12 text-gray-800 font-sans selection:bg-[#FF6F61]/10 selection:text-[#FF6F61]',
      },
      // 处理拖拽上传图片
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0] && onImageUpload) {
          const file = event.dataTransfer.files[0];
          const type = file.type;
          
          if (type.startsWith('image/')) {
            event.preventDefault();
            
            const { schema } = view.state;
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            const insertPos = coordinates?.pos ?? view.state.selection.from;
            
            // 先插入一个占位符（加载中的图片）
            const tempNode = schema.nodes.paragraph.create(null, [
              schema.text(t('editor.uploading') || '🖼️ 上传中...')
            ]);
            const tempTr = view.state.tr.insert(insertPos, tempNode);
            view.dispatch(tempTr);
            
            // 异步上传图片
            onImageUpload(file).then(url => {
              // 查找并删除占位符，插入真实图片
              const { state } = view;
              let found = false;
              let deleteFrom = -1;
              let deleteTo = -1;
              
              state.doc.descendants((node, pos) => {
                if (!found && node.isText && node.text?.includes(t('editor.uploading') || '🖼️ 上传中...')) {
                  deleteFrom = pos;
                  deleteTo = pos + node.nodeSize;
                  found = true;
                  return false;
                }
              });
              
              if (found && deleteFrom >= 0) {
                const imageNode = schema.nodes.image.create({ src: url });
                const tr = state.tr
                  .delete(deleteFrom, deleteTo)
                  .insert(deleteFrom, imageNode);
                view.dispatch(tr);
              } else {
                // 如果找不到占位符，就在当前位置插入
                const imageNode = schema.nodes.image.create({ src: url });
                const tr = state.tr.insert(state.selection.from, imageNode);
                view.dispatch(tr);
              }
            }).catch(error => {
              console.error('图片上传失败:', error);
              // 删除占位符并显示错误
              const { state } = view;
              let found = false;
              let deleteFrom = -1;
              let deleteTo = -1;
              
              state.doc.descendants((node, pos) => {
                if (!found && node.isText && node.text?.includes(t('editor.uploading') || '🖼️ 上传中...')) {
                  deleteFrom = pos;
                  deleteTo = pos + node.nodeSize;
                  found = true;
                  return false;
                }
              });
              
              if (found && deleteFrom >= 0) {
                const errorText = schema.text(`${t('editor.uploadFailed')}: ${error.message || '未知错误'}`);
                const errorNode = schema.nodes.paragraph.create(null, [errorText]);
                const tr = state.tr
                  .delete(deleteFrom, deleteTo)
                  .insert(deleteFrom, errorNode);
                view.dispatch(tr);
              }
            });
            
            return true;
          }
        }
        return false;
      },
    },
  });

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files?.length && onImageUpload) {
        const file = input.files[0];
        try {
          const url = await onImageUpload(file);
          editor?.chain().focus().setImage({ src: url }).run();
        } catch (error) {
          console.error('图片插入失败', error);
        }
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="relative w-full">
      {/* 浮动气泡菜单 */}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-1 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl p-1.5 animate-in fade-in zoom-in duration-300 overflow-hidden"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-xl transition-all ${editor.isActive('bold') ? 'bg-[#FF6F61] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-xl transition-all ${editor.isActive('italic') ? 'bg-[#FF6F61] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-xl transition-all ${editor.isActive('underline') ? 'bg-[#FF6F61] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded-xl transition-all ${editor.isActive('strike') ? 'bg-[#FF6F61] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* 气泡菜单颜色选择 */}
          <button
            onClick={() => editor.chain().focus().setColor('#FF6F61').run()}
            className={`p-2 rounded-xl transition-all ${editor.isActive('textStyle', { color: '#FF6F61' }) ? 'bg-[#FF6F61]/10 text-[#FF6F61]' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Palette className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-gray-200 mx-1" />
          <button
            onClick={setLink}
            className={`p-2 rounded-xl transition-all ${editor.isActive('link') ? 'bg-[#FF6F61] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-gray-200 mx-1" />
          <button
            onClick={() => editor.chain().focus().setTextAlign?.('left').run()}
            className={`p-2 rounded-xl transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-[#FF6F61] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign?.('center').run()}
            className={`p-2 rounded-xl transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-[#FF6F61] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}

      {/* 固定工具栏 */}
      <div className="sticky top-[80px] z-30 flex items-center flex-wrap gap-1 bg-white/80 backdrop-blur-xl border border-gray-100 shadow-sm rounded-3xl p-2 mb-12 animate-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-1 pr-2 border-r border-gray-100 mr-1">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2.5 rounded-2xl transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <Heading1 className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2.5 rounded-2xl transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <Heading2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-gray-100 mr-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2.5 rounded-2xl transition-all ${editor.isActive('bold') ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <Bold className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2.5 rounded-2xl transition-all ${editor.isActive('italic') ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <Italic className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2.5 rounded-2xl transition-all ${editor.isActive('underline') ? 'bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/20' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <UnderlineIcon className="w-5 h-5" />
          </button>

          {/* 字体选择 */}
          <div className="relative" ref={fontDropdownRef}>
            <button
              onClick={() => setShowFontDropdown(!showFontDropdown)}
              className={`flex items-center gap-1 p-2.5 rounded-2xl transition-all ${editor.isActive('textStyle', { fontFamily: undefined }) ? 'text-gray-400 hover:bg-gray-50' : 'bg-gray-100 text-gray-900'}`}
              title={t('editor.changeFont')}
            >
              <Type className="w-5 h-5" />
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFontDropdown && (
              <div className="absolute top-full left-0 mt-2 z-[60] w-48 bg-white/95 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl p-2 animate-in fade-in zoom-in duration-200">
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
                    key={font.value}
                    onClick={() => {
                      editor.chain().focus().setFontFamily(font.value).run();
                      setShowFontDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all hover:bg-gray-50 ${editor.isActive('textStyle', { fontFamily: font.value }) ? 'text-[#FF6F61] bg-[#FF6F61]/5' : 'text-gray-600'}`}
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1 pt-1">
                  <button
                    onClick={() => {
                      editor.chain().focus().unsetFontFamily().run();
                      setShowFontDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-50 transition-all"
                  >
                    {t('editor.resetFont')}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 自定义文字颜色 (Palette) */}
          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`p-2.5 rounded-2xl transition-all ${editor.getAttributes('textStyle').color ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
              style={{ color: editor.getAttributes('textStyle').color }}
              title={t('editor.changeColor')}
            >
              <Palette className="w-5 h-5" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-2 z-[60] shadow-2xl animate-in fade-in zoom-in duration-200">
                <SketchPicker 
                  color={editor.getAttributes('textStyle').color || '#000000'}
                  onChange={(color) => editor.chain().focus().setColor(color.hex).run()}
                  presetColors={['#FF6F61', '#000000', '#ffffff', '#4a4a4a', '#9b9b9b', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#607d8b']}
                />
              </div>
            )}
          </div>

          {/* 背景颜色 (Highlighter) */}
          <div className="relative" ref={bgColorPickerRef}>
            <button
              onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              className={`p-2.5 rounded-2xl transition-all ${editor.isActive('highlight') ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-yellow-600 hover:bg-gray-50'}`}
              style={{ backgroundColor: editor.getAttributes('highlight').color }}
              title={t('editor.changeBgColor')}
            >
              <Highlighter className="w-5 h-5" />
            </button>
            {showBgColorPicker && (
              <div className="absolute top-full left-0 mt-2 z-[60] shadow-2xl animate-in fade-in zoom-in duration-200">
                <SketchPicker 
                  color={editor.getAttributes('highlight').color || '#ffff00'}
                  onChange={(color) => editor.chain().focus().setHighlight({ color: color.hex }).run()}
                  presetColors={['#ffff00', '#FF6F61', '#9eff00', '#00ff73', '#00f7ff', '#0044ff', '#b300ff', '#ff006a']}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-gray-100 mr-1">
          <button
            onClick={() => editor.chain().focus().setTextAlign?.('left').run()}
            className={`p-2.5 rounded-2xl transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <AlignLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign?.('center').run()}
            className={`p-2.5 rounded-2xl transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <AlignCenter className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign?.('right').run()}
            className={`p-2.5 rounded-2xl transition-all ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <AlignRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1 pr-2 border-r border-gray-100 mr-1">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2.5 rounded-2xl transition-all ${editor.isActive('bulletList') ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2.5 rounded-2xl transition-all ${editor.isActive('orderedList') ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <ListOrdered className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2.5 rounded-2xl transition-all ${editor.isActive('blockquote') ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Quote className="w-5 h-5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2.5 rounded-2xl transition-all ${editor.isActive('codeBlock') ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Code className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={addImage}
          className="ml-auto p-2.5 rounded-2xl text-[#FF6F61] bg-[#FF6F61]/5 hover:bg-[#FF6F61] hover:text-white hover:shadow-lg hover:shadow-[#FF6F61]/20 transition-all flex items-center gap-2 px-5"
        >
          <ImageIcon className="w-5 h-5" />
          <span className="text-sm font-bold tracking-tight">{t('editor.insertImage')}</span>
        </button>
      </div>

      <EditorContent editor={editor} />
      
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #cbd5e1;
          pointer-events: none;
          height: 0;
          font-weight: 500;
        }
        .tiptap {
          outline: none !important;
          position: relative;
        }
        .tiptap p {
          margin: 1.8em 0;
          line-height: 2;
          font-size: 1.125rem;
        }
        .tiptap blockquote {
          border-left: 6px solid #FF6F61;
          background: #faf9f6;
          padding: 2rem 3rem;
          border-radius: 0 2rem 2rem 0;
          font-style: italic;
          color: #4a4a4a;
          margin: 3.5rem 0;
          font-size: 1.25rem;
          box-shadow: inset 10px 0 30px rgba(255,111,97,0.03);
        }
        .tiptap h1 { font-size: 2.5rem; font-weight: 900; margin-top: 4rem; margin-bottom: 2rem; color: #111; letter-spacing: -0.02em; }
        .tiptap h2 { font-size: 2rem; font-weight: 800; margin-top: 3.5rem; margin-bottom: 1.5rem; color: #222; letter-spacing: -0.01em; }
        .tiptap img {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tiptap img.ProseMirror-selectednode {
          outline: 3px solid #FF6F61;
          box-shadow: 0 0 0 10px rgba(255,111,97,0.1);
        }
      `}</style>
    </div>
  );
}
