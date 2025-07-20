import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IoClose } from "react-icons/io5";
import CustomImageTag from "../CustomImageTag";
import { MdClose } from "react-icons/md";

const RateServiceDialog = ({ 
    open, 
    onClose, 
    onSubmit, 
    t, 
    selectedServiceId,
    isEditMode = false,
    existingReview = null 
}) => {
    
    const [formData, setFormData] = useState({
        rating: existingReview?.rating || 0,
        comment: existingReview?.comment || "",
        images: existingReview?.images || [],
        reviewId: existingReview?._id || null
    });

    const [previewImages, setPreviewImages] = useState(() => {
        if (existingReview?.images && existingReview.images.length > 0) {
            return existingReview.images.map(img => {
                if (typeof img === 'string') return img;
                if (img instanceof File) return URL.createObjectURL(img);
                if (img.url) return img.url;
                return img;
            });
        }
        return [];
    });

    const [isDragging, setIsDragging] = useState(false);

    const handleImageChange = (files) => {
        const newFiles = Array.from(files);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newFiles]
        }));
        setPreviewImages(prev => [...prev, ...newFiles.map(file => URL.createObjectURL(file))]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        handleImageChange(files);
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        // Check if rating and comment are provided
        if (!formData.rating || !formData.comment.trim()) {
            return;
        }

        onSubmit({
            ...formData,
            isEdit: isEditMode
        });

        // Reset form
        setFormData({
            rating: 0,
            comment: "",
            images: [],
            reviewId: null
        });

        setPreviewImages([]);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <div className="flex justify-between items-center">
                    <DialogTitle className="text-xl font-semibold">
                        {isEditMode ? t("editReview") : t("rateService")}
                    </DialogTitle>
                    <MdClose size={20} className="cursor-pointer" onClick={onClose} />
                </div>

                {/* Rating Stars */}
                <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                            className="focus:outline-none"
                        >
                            <FaStar
                                size={24}
                                className={star <= formData.rating ? "primary_text_color" : "text-gray-300"}
                            />
                        </button>
                    ))}
                </div>

                {/* Review Text */}
                <Textarea
                    placeholder={t("writeReview")}
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    className="min-h-[100px] focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />

                {/* Image Upload */}
                <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                        {previewImages.map((preview, index) => (
                            <div
                                key={index}
                                className="relative transform scale-0 animate-in slide-in-from-left-5 duration-300 group"
                                style={{
                                    animation: `slideIn 0.3s ease-out ${index * 0.1}s forwards`
                                }}
                            >
                                <CustomImageTag
                                    src={preview}
                                    alt="preview"
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute inset-0 rounded-lg hidden group-hover:flex items-center justify-center bg-gradient-to-t from-black/70 to-black/30 text-white transition-all duration-200"
                                >
                                    <IoClose size={20} />
                                </button>
                            </div>
                        ))}
                        <label
                            className="relative transform scale-0 animate-in slide-in-from-left-5 duration-300"
                            style={{
                                animation: `slideIn 0.3s ease-out ${previewImages.length * 0.1}s forwards`
                            }}
                        >
                            <div
                                className={`w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-primary bg-primary/10 scale-105' : 'border-gray-300'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageChange(e.target.files)}
                                />
                                <span
                                    className="text-3xl text-gray-400 transition-transform duration-300"
                                    style={{
                                        transform: isDragging ? 'rotate(45deg)' : 'rotate(0deg)'
                                    }}
                                >
                                    +
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    onClick={handleSubmit}
                    className="w-full primary_bg_color text-white disabled:!bg-gray-300 disabled:!description_color disabled:cursor-not-allowed dark:disabled:text-black"
                    disabled={!formData.rating || !formData.comment.trim()}
                >
                    {t("submitReview")}
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default RateServiceDialog;

// Update the keyframe animations
const styles = `
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px) scale(0);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
}
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}