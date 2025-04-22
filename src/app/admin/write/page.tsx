"use client";
import { useState, useRef } from "react";
import Button from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { SketchPicker } from 'react-color';

export default function AdminWritePage() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("'Microsoft YaHei', '微软雅黑', Arial, sans-serif");
  const [images, setImages] = useState<string[]>([]);
  const [cover, setCover] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [fontColor, setFontColor] = useState('#222222');

  // 模拟图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = URL.createObjectURL(files[i]);
        newImages.push(url);
      }
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const handleInsertImage = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里可以提交到后端
    alert('文章已保存（模拟）');
    router.back();
  };

  // 富文本操作
  const insertAround = (before: string, after: string = before) => {
    const textarea = document.getElementById('article-content') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const newText = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };
  const insertColor = (color: string) => {
    const textarea = document.getElementById('article-content') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const colorTag = `<span style=\"color:${color}\">${selected}</span>`;
    const newText = content.slice(0, start) + colorTag + content.slice(end);
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + colorTag.length, start + colorTag.length);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-[#FFFACD] flex">
      {/* 侧边栏（大屏常驻，小屏弹出） */}
      <button
        className="fixed top-4 left-4 z-30 md:hidden bg-[#FF6F61] text-white p-2 rounded-full shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="展开侧边栏"
        style={{ display: sidebarOpen ? 'none' : 'block' }}
      >
        <Menu size={24} />
      </button>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
          fixed z-30 top-0 left-0 h-full w-56 bg-white/95 border-r border-[#FF6F61] flex flex-col pt-32 pb-6 px-3 gap-4
          shadow-xl rounded-r-2xl transition-transform duration-300 backdrop-blur-sm
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-56 md:flex md:shadow-none md:rounded-none md:bg-white md:backdrop-blur-0
        `}
        style={{ minWidth: '14rem', maxWidth: '14rem' }}
      >
        <Button
          className={`w-full text-black font-semibold transition-all duration-300 rounded-lg py-2 ${false ? 'bg-[#FF6F61] !text-black shadow-md' : 'bg-white !text-black border border-[#FF6F61]'}`}
          onClick={() => { router.push('/admin/dashboard'); setSidebarOpen(false); }}
        >
          返回管理
        </Button>
      </aside>
      {/* 主内容区 */}
      <main className="flex-1 flex flex-col items-center py-12 px-4 transition-all duration-300 md:ml-56">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg border border-[#FF6F61] p-8">
          <h1 className="text-2xl font-bold text-[#FF6F61] mb-6 text-center">写文章</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium text-[#FF6F61] mb-1">标题</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-[#FF6F61] rounded px-3 py-2" placeholder="请输入文章标题" />
            </div>
            <div>
              <label className="block font-medium text-[#FF6F61] mb-1">标签（逗号分隔）</label>
              <input value={tags} onChange={e => setTags(e.target.value)} className="w-full border border-[#FF6F61] rounded px-3 py-2" placeholder="如：八字,命理" />
            </div>
            <div>
              <label className="block font-medium text-[#FF6F61] mb-1">正文</label>
              <div className="flex gap-2 mb-2 items-center">
                <Button type="button" className="bg-[#FF6F61] text-white px-4" onClick={() => insertAround('**')}>B</Button>
                <Button type="button" className="bg-[#FF6F61] text-white px-4 italic" onClick={() => insertAround('*')}>I</Button>
                <Button type="button" className="bg-[#FF6F61] text-white px-4" onClick={() => setShowColorPicker(v => !v)}>A</Button>
                {showColorPicker && (
                  <div className="absolute z-50">
                    <SketchPicker color={fontColor} onChange={c => setFontColor(c.hex)} onChangeComplete={c => { insertColor(c.hex); setShowColorPicker(false); }} />
                  </div>
                )}
              </div>
              <textarea
                id="article-content"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={10}
                className="w-full border border-[#FF6F61] rounded px-3 py-2"
                style={{ fontSize: fontSize + 'px', fontFamily, color: fontColor }}
                placeholder="请输入正文内容"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="font-medium text-[#FF6F61]">是否付费文章</label>
              <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} className="w-5 h-5 accent-[#FF6F61]" />
            </div>
            <div className="flex items-center gap-4">
              <label className="font-medium text-[#FF6F61]">字号</label>
              <select value={fontSize} onChange={e => setFontSize(e.target.value)} className="border border-[#FF6F61] rounded px-2 py-1">
                {Array.from({length: 15}, (_, i) => 8 + i*2).map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
              <label className="font-medium text-[#FF6F61]">字体</label>
              <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="border border-[#FF6F61] rounded px-2 py-1">
                <option value="'Microsoft YaHei', '微软雅黑', Arial, sans-serif">微软雅黑</option>
                <option value="SimSun, '宋体', serif">宋体</option>
                <option value="Arial, Helvetica, sans-serif">Arial</option>
                <option value="serif">Serif</option>
                <option value="sans-serif">Sans-serif</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#FF6F61] mb-1">插入图片</label>
              <div className="flex flex-wrap gap-3 mb-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt="插图" className={`w-24 h-24 object-cover rounded border-2 ${cover === img ? 'border-[#FF6F61]' : 'border-gray-200'}`} onClick={() => setCover(img)} />
                    {cover === img && <span className="absolute top-1 left-1 bg-[#FF6F61] text-white text-xs px-2 py-0.5 rounded">封面</span>}
                  </div>
                ))}
                <button type="button" onClick={handleInsertImage} className="w-24 h-24 flex items-center justify-center border-2 border-dashed border-[#FF6F61] rounded text-[#FF6F61] hover:bg-[#FF6F61]/10">
                  +
                </button>
                <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
              </div>
              <div className="text-xs text-gray-500">点击图片可设为封面，支持多图上传</div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-[#FF6F61] text-white px-6">提交文章</Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 