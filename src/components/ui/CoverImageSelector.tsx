'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Check, Image as ImageIcon, Move, RotateCcw, Maximize } from 'lucide-react';
import Button from '@/components/ui/button';
import { getImageUrl } from '@/config/api';

interface CoverImageSelectorProps {
  selectedCover: string | null;
  contentImages: string[];
  onCoverSelect: (imageUrl: string | null) => void;
  onImageUpload: (file: File) => Promise<string>;
  coverSettings?: {
    scale: number;
    positionX: number;
    positionY: number;
  };
  onCoverSettingsChange?: (settings: {
    scale: number;
    positionX: number;
    positionY: number;
  }) => void;
  className?: string;
}

interface CoverSettings {
  scale: number;
  positionX: number;
  positionY: number;
}

const CoverImageSelector: React.FC<CoverImageSelectorProps> = ({
  selectedCover,
  contentImages,
  onCoverSelect,
  onImageUpload,
  coverSettings,
  onCoverSettingsChange,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [coverSettingsState, setCoverSettingsState] = useState<CoverSettings>({
    scale: coverSettings?.scale || 1,
    positionX: coverSettings?.positionX || 50,
    positionY: coverSettings?.positionY || 50
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, posX: 0, posY: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverPreviewRef = useRef<HTMLDivElement>(null);

  // 只在外部coverSettings改变时同步一次
  useEffect(() => {
    if (coverSettings) {
      setCoverSettingsState({
        scale: coverSettings.scale,
        positionX: coverSettings.positionX,
        positionY: coverSettings.positionY
      });
    }
  }, [coverSettings?.scale, coverSettings?.positionX, coverSettings?.positionY]);

  // 创建一个包装函数来处理settings变化
  const handleCoverSettingsChange = useCallback((newSettings: CoverSettings) => {
    setCoverSettingsState(newSettings);
    if (onCoverSettingsChange) {
      onCoverSettingsChange(newSettings);
    }
  }, [onCoverSettingsChange]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      setIsUploading(true);
      const url = await onImageUpload(file);
      onCoverSelect(url);
      // 重置封面设置
      handleCoverSettingsChange({ scale: 1, positionX: 50, positionY: 50 });
    } catch (error) {
      console.error('上传失败:', error);
      alert('图片上传失败，请重试');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    onCoverSelect(selectedCover === imageUrl ? null : imageUrl);
    // 重置封面设置
    handleCoverSettingsChange({ scale: 1, positionX: 50, positionY: 50 });
    setIsEditing(false);
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditing) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      posX: coverSettingsState.positionX,
      posY: coverSettingsState.positionY
    });
  }, [isEditing, coverSettingsState]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !coverPreviewRef.current) return;

    const rect = coverPreviewRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // 修复方向：鼠标右移图片右移，鼠标下移图片下移
    const newPosX = Math.max(0, Math.min(100, dragStart.posX - (deltaX / rect.width) * 100)); // 水平方向用减号
    const newPosY = Math.max(0, Math.min(100, dragStart.posY - (deltaY / rect.height) * 100)); // 垂直方向也用减号
    
    handleCoverSettingsChange({
      ...coverSettingsState,
      positionX: newPosX,
      positionY: newPosY
    });
  }, [isDragging, dragStart, coverSettingsState, handleCoverSettingsChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 监听鼠标事件
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const resetCoverSettings = () => {
    handleCoverSettingsChange({ scale: 1, positionX: 50, positionY: 50 });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">封面图片</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            {isUploading ? '上传中...' : '上传封面'}
          </Button>
          {selectedCover && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 ${
                  isEditing ? 'bg-blue-50 text-blue-600 border-blue-300' : ''
                }`}
              >
                <Move size={16} />
                {isEditing ? '完成编辑' : '调整位置'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onCoverSelect(null)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <X size={16} />
                移除封面
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 当前选中的封面 */}
      {selectedCover && (
        <div className="space-y-4">
          <div 
            ref={coverPreviewRef}
            className="relative w-full h-48 overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100"
            onMouseDown={handleMouseDown}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${getImageUrl(selectedCover)})`,
                backgroundSize: `${coverSettingsState.scale * 100}%`,
                backgroundPosition: `${coverSettingsState.positionX}% ${coverSettingsState.positionY}%`,
                backgroundRepeat: 'no-repeat',
                transition: isEditing ? 'none' : 'background-size 0.2s ease, background-position 0.2s ease',
                cursor: isEditing ? 'move' : 'default',
                userSelect: isEditing ? 'none' : 'auto',
                zIndex: 1
              }}
            />
            
            {!isEditing && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full z-10">
                <Check size={16} />
              </div>
            )}
          </div>
          
          {/* 编辑模式提示移到容器外面 */}
          {isEditing && (
            <div className="text-center py-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                拖拽图片调整位置
              </span>
            </div>
          )}

          {/* 封面编辑控制 */}
          {isEditing && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">封面调整</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetCoverSettings}
                  className="flex items-center gap-2 text-xs"
                >
                  <RotateCcw size={14} />
                  重置
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    缩放比例: {Math.round(coverSettingsState.scale * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={coverSettingsState.scale}
                    onChange={(e) => handleCoverSettingsChange({
                      ...coverSettingsState,
                      scale: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      水平位置: {Math.round(coverSettingsState.positionX)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={coverSettingsState.positionX}
                      onChange={(e) => handleCoverSettingsChange({
                        ...coverSettingsState,
                        positionX: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      垂直位置: {Math.round(coverSettingsState.positionY)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={coverSettingsState.positionY}
                      onChange={(e) => handleCoverSettingsChange({
                        ...coverSettingsState,
                        positionY: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 从文章图片中选择 */}
      {contentImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            从已保存的图片中选择封面 ({contentImages.length} 张)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {contentImages.map((imageUrl, index) => (
              <div
                key={index}
                className={`relative cursor-pointer rounded-lg border-2 transition-all hover:border-blue-300 ${
                  selectedCover === imageUrl
                    ? 'border-blue-500'
                    : 'border-gray-200'
                }`}
                onClick={() => handleImageSelect(imageUrl)}
              >
                <img
                  src={getImageUrl(imageUrl)}
                  alt={`图片 ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                {selectedCover === imageUrl && (
                  <div 
                    className="absolute inset-0 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                  >
                    <div className="bg-white text-blue-600 p-1 rounded-full shadow-md">
                      <Check size={16} />
                    </div>
                  </div>
                )}
                <div className="absolute top-1 right-1 bg-green-500 text-white p-1 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                  <Maximize size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 无图片时的提示 */}
      {contentImages.length === 0 && !selectedCover && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无封面图片</h3>
          <p className="mt-1 text-sm text-gray-500">
            请上传图片并保存文章后，图片将出现在这里供选择作为封面
          </p>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default CoverImageSelector; 