'use client';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  List, 
  ListOrdered, 
  Quote, 
  Minus,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Undo,
  Redo,
  Move,
  RotateCcw
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  onSetCover?: (imageUrl: string) => void;
  placeholder?: string;
  className?: string;
}

// 增强的图片扩展，支持缩放
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute('height'),
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
      'data-display': {
        default: 'block',
        parseHTML: (element) => element.getAttribute('data-display'),
        renderHTML: (attributes) => {
          return {
            'data-display': attributes['data-display'],
          };
        },
      },
    };
  },
  
  addNodeView() {
    return ({ node, getPos, editor, view, decorations }) => {
      const container = document.createElement('div');
      container.style.position = 'relative';
      container.style.display = 'inline-block';
      container.style.margin = '10px 0';
      container.className = 'image-container';

      const img = document.createElement('img');
      // 直接使用节点中的src，不做转换
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || '';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.borderRadius = '8px';
      img.style.cursor = 'pointer';
      
      // 添加图片加载错误处理
      img.onerror = () => {
        console.error('图片加载失败:', img.src);
        // 可以在这里设置一个占位图片
        img.style.border = '2px dashed #ccc';
        img.style.background = '#f5f5f5';
        img.style.minHeight = '100px';
        img.style.color = '#999';
        img.style.display = 'flex';
        img.style.alignItems = 'center';
        img.style.justifyContent = 'center';
        img.style.fontSize = '14px';
        img.alt = '图片加载失败';
      };
      
      img.onload = () => {
        console.log('图片加载成功:', img.src);
      };
      
      // 如果有设置的宽度，应用它
      if (node.attrs.width) {
        img.style.width = node.attrs.width + 'px';
      }

      // 创建缩放控制点
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      resizeHandle.style.position = 'absolute';
      resizeHandle.style.bottom = '0';
      resizeHandle.style.right = '0';
      resizeHandle.style.width = '20px';
      resizeHandle.style.height = '20px';
      resizeHandle.style.backgroundColor = '#007bff';
      resizeHandle.style.cursor = 'se-resize';
      resizeHandle.style.borderRadius = '50%';
      resizeHandle.style.opacity = '0';
      resizeHandle.style.transition = 'opacity 0.2s';
      resizeHandle.style.zIndex = '10';
      resizeHandle.style.border = '2px solid white';
      resizeHandle.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

      // 重置按钮
      const resetButton = document.createElement('button');
      resetButton.innerHTML = '↻';
      resetButton.style.position = 'absolute';
      resetButton.style.top = '5px';
      resetButton.style.right = '5px';
      resetButton.style.width = '24px';
      resetButton.style.height = '24px';
      resetButton.style.backgroundColor = '#6c757d';
      resetButton.style.color = 'white';
      resetButton.style.border = 'none';
      resetButton.style.borderRadius = '50%';
      resetButton.style.cursor = 'pointer';
      resetButton.style.opacity = '0';
      resetButton.style.transition = 'opacity 0.2s';
      resetButton.style.fontSize = '12px';
      resetButton.style.display = 'flex';
      resetButton.style.alignItems = 'center';
      resetButton.style.justifyContent = 'center';
      resetButton.title = '重置原始大小';

      // 设为封面按钮
      const setCoverButton = document.createElement('button');
      setCoverButton.innerHTML = '📰';
      setCoverButton.style.position = 'absolute';
      setCoverButton.style.top = '5px';
      setCoverButton.style.right = '35px';
      setCoverButton.style.width = '24px';
      setCoverButton.style.height = '24px';
      setCoverButton.style.backgroundColor = '#28a745';
      setCoverButton.style.color = 'white';
      setCoverButton.style.border = 'none';
      setCoverButton.style.borderRadius = '50%';
      setCoverButton.style.cursor = 'pointer';
      setCoverButton.style.opacity = '0';
      setCoverButton.style.transition = 'opacity 0.2s';
      setCoverButton.style.fontSize = '10px';
      setCoverButton.style.display = 'flex';
      setCoverButton.style.alignItems = 'center';
      setCoverButton.style.justifyContent = 'center';
      setCoverButton.title = '设为封面';

      // 鼠标进入显示控制点
      container.addEventListener('mouseenter', () => {
        resizeHandle.style.opacity = '1';
        resetButton.style.opacity = '1';
        setCoverButton.style.opacity = '1';
      });

      container.addEventListener('mouseleave', () => {
        resizeHandle.style.opacity = '0';
        resetButton.style.opacity = '0';
        setCoverButton.style.opacity = '0';
      });

      // 缩放功能
      let startX: number, startY: number, startWidth: number, startHeight: number, aspectRatio: number;
      
      resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;
        aspectRatio = startWidth / startHeight;

        const handleMouseMove = (e: MouseEvent) => {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          
          // 使用X轴变化来计算新尺寸，保持长宽比
          const newWidth = Math.max(100, startWidth + deltaX);
          const newHeight = newWidth / aspectRatio;
          
          img.style.width = newWidth + 'px';
          img.style.height = newHeight + 'px';
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          
          // 更新节点属性
          const pos = getPos();
          if (typeof pos === 'number') {
            view.dispatch(
              view.state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                width: Math.round(img.offsetWidth),
                height: Math.round(img.offsetHeight),
              })
            );
          }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      });

      // 重置功能
      resetButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // 重置到原始大小
        img.style.width = '';
        img.style.height = '';
        
        const pos = getPos();
        if (typeof pos === 'number') {
          view.dispatch(
            view.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              width: null,
              height: null,
            })
          );
        }
      });

      // 设为封面功能
      setCoverButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // 通过editor的storage获取onSetCover函数
        const onSetCover = editor.storage.onSetCover;
        if (onSetCover) {
          onSetCover(node.attrs.src);
        }
      });

      container.appendChild(img);
      container.appendChild(resizeHandle);
      container.appendChild(resetButton);
      container.appendChild(setCoverButton);

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) {
            return false;
          }
          
          // 更新图片属性
          if (updatedNode.attrs.src !== node.attrs.src) {
            img.src = updatedNode.attrs.src;
          }
          
          if (updatedNode.attrs.alt !== node.attrs.alt) {
            img.alt = updatedNode.attrs.alt || '';
          }
          
          if (updatedNode.attrs.width) {
            img.style.width = updatedNode.attrs.width + 'px';
          } else {
            img.style.width = '';
          }
          
          if (updatedNode.attrs.height) {
            img.style.height = updatedNode.attrs.height + 'px';
          } else {
            img.style.height = '';
          }

          return true;
        },
      };
    };
  },
});

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onImageUpload,
  onSetCover,
  placeholder = '开始写作...',
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭颜色选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // 禁用StarterKit中的dropCursor和gapCursor，防止重复
        dropcursor: false,
        gapcursor: false,
      }),
      ResizableImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      Color,
      TextStyle,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    immediatelyRender: false, // 修复SSR水合错误
    onCreate: ({ editor }) => {
      // 存储onSetCover函数到editor.storage
      editor.storage.onSetCover = onSetCover;
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              event.preventDefault();
              const file = items[i].getAsFile();
              if (file) {
                handleImageUpload(file);
              }
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  // 在编辑器创建后的初始化
  useEffect(() => {
    if (editor) {
      console.log('🔄 [RichTextEditor] 编辑器内容更新');
      console.log('  - 新内容长度:', content.length);
      console.log('  - 内容预览:', content.substring(0, 200) + (content.length > 200 ? '...' : ''));
      
      // 检查是否有临时图片引用
      const tempImageRegex = /http:\/\/[^\/]+:14761\/temp-images\/[^"'\s]+/g;
      const tempMatches = content.match(tempImageRegex) || [];
      if (tempMatches.length > 0) {
        console.warn('⚠️ [RichTextEditor] 检测到临时图片引用:', tempMatches);
      } else {
        console.log('✅ [RichTextEditor] 内容中没有临时图片引用');
      }
      
      // 只有当内容不同时才更新
      if (content !== editor.getHTML()) {
        console.log('📝 [RichTextEditor] 设置新内容到编辑器');
        editor.commands.setContent(content);
      }
      
      console.log('编辑器已创建，内容已加载');
    }
  }, [editor, content]);

  const handleImageUpload = async (file: File) => {
    if (!onImageUpload || !editor) return;

    try {
      setIsUploading(true);
      console.log('开始上传图片:', file.name);
      
      const url = await onImageUpload(file);
      console.log('图片上传成功，返回URL:', url);
      
      // 直接使用返回的URL插入图片
      editor.chain().focus().setImage({ src: url }).run();
      
      console.log('图片已插入到编辑器');
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
    // 清空input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children, 
    title 
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => {
        // 防止按钮获得焦点，这样编辑器就不会失去焦点
        e.preventDefault();
      }}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FF6F61', '#800080', '#008000',
    '#000080', '#808080', '#FFA500', '#A52A2A', '#FFC0CB'
  ];

  if (!editor) {
    return <div className="h-96 bg-gray-100 animate-pulse rounded"></div>;
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      {/* 添加图片缩放样式 */}
      <style jsx global>{`
        .image-container {
          position: relative;
          display: inline-block;
          margin: 10px 0;
        }
        
        .image-container:hover .resize-handle {
          opacity: 1 !important;
        }
        
        .image-container:hover .reset-button {
          opacity: 1 !important;
        }
        
        .resize-handle {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 20px;
          height: 20px;
          background-color: #007bff;
          cursor: se-resize;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 10;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .resize-handle:hover {
          background-color: #0056b3;
        }
      `}</style>
      
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-1 p-3 bg-gray-50 border-b border-gray-200">
        {/* 撤销重做 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="撤销"
        >
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="重做"
        >
          <Redo size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 标题 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="标题 1"
        >
          <Heading1 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="标题 2"
        >
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="标题 3"
        >
          <Heading3 size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 文字格式 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="加粗"
        >
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="斜体"
        >
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="删除线"
        >
          <Strikethrough size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="代码"
        >
          <Code size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 对齐 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="左对齐"
        >
          <AlignLeft size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="居中"
        >
          <AlignCenter size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="右对齐"
        >
          <AlignRight size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 列表 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="无序列表"
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="有序列表"
        >
          <ListOrdered size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 引用 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="引用"
        >
          <Quote size={18} />
        </ToolbarButton>

        {/* 分割线 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="分割线"
        >
          <Minus size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* 颜色 */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="文字颜色"
          >
            <Palette size={18} />
          </ToolbarButton>
          {showColorPicker && (
            <div ref={colorPickerRef} className="absolute top-full left-0 mt-2 z-10 bg-white shadow-lg rounded border border-gray-300 p-3">
              <div className="grid grid-cols-5 gap-2">
                {colors.map(color => (
                  <div
                    key={color}
                    className="w-6 h-6 cursor-pointer border border-gray-300 rounded hover:border-gray-500 transition-all"
                    style={{ backgroundColor: color }}
                    onMouseDown={(e) => {
                      // 防止失去焦点
                      e.preventDefault();
                    }}
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setShowColorPicker(false);
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 图片 */}
        <ToolbarButton
          onClick={() => {
            // 先确保编辑器有焦点，然后再打开文件选择
            editor.chain().focus().run();
            fileInputRef.current?.click();
          }}
          disabled={isUploading}
          title="插入图片"
        >
          <ImageIcon size={18} />
        </ToolbarButton>
        {isUploading && (
          <span className="text-sm text-blue-600">上传中...</span>
        )}
      </div>

      {/* 编辑器内容 */}
      <div className="relative">
        <EditorContent
          editor={editor}
          className="min-h-[400px] prose prose-lg max-w-none"
        />
        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* 提示信息 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
        支持拖拽图片到编辑器中，或使用 Ctrl+V 粘贴图片。鼠标悬停图片显示缩放控制。
      </div>
    </div>
  );
};

export default RichTextEditor; 