import React from 'react';
import { useTranslation } from '@/components/Layout/TranslationContext';
import { FaPlus } from 'react-icons/fa';
import { RiSendPlaneFill } from 'react-icons/ri';
import MiniLoader from '@/components/ReUseableComponents/MiniLoader';
import { useRTL } from '@/utils/Helper';

const ChatInput = ({
    attachedFiles,
    renderFilePreview,
    handleFileAttachment,
    message,
    handleMessageChange,
    MaxCharactersInTextMessage,
    handleSend,
    isSending,
    isDisabled,
    disabledMessage,
    blockedStatus,
    inputId = "chatFileAttachment"
}) => {
    const t = useTranslation();
    const isRTL = useRTL();

    if (blockedStatus?.blockedByUser || blockedStatus?.blockedByProvider) {
        return (
            <div className='p-3 border-t text-center' style={{ 
                backgroundColor: blockedStatus.blockedByUser ? '#FEE2E2' : '#FEF3C7',
                color: blockedStatus.blockedByUser ? '#991B1B' : '#92400E'
            }}>
                {blockedStatus.message}
            </div>
        );
    }

    if (isDisabled) {
        return (
            <div className='p-3 bg-yellow-50 border-t text-center text-amber-800'>
                {disabledMessage || t("sorryYouCantSendMessage")}
            </div>
        );
    }

    return (
        <div>
            {attachedFiles.length > 0 && (
                <div className='w-full border-t px-3 py-2 flex-wrap flex gap-2 overflow-auto max-h-[200px] card_bg'>
                    {attachedFiles.map((file, index) => renderFilePreview(file, index))}
                </div>
            )}
            <div className='w-full p-2 md:p-3 card_bg border-t flex gap-2 items-center rounded-b-lg'>
                <label htmlFor={inputId} className="cursor-pointer">
                    <input
                        type="file"
                        id={inputId}
                        multiple
                        onChange={handleFileAttachment}
                        className="hidden"
                    />
                    <div className='md:h-10 md:w-10 h-8 w-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer'>
                        <FaPlus className='text-gray-600' />
                    </div>
                </label>
                <div className='relative w-full border dark:border_color rounded-md flex flex-col items-center justify-end'>
                    <textarea
                        className="w-full input-like p-2 md:p-3 rounded-md bg-transparent  resize-none overflow-hidden min-h-[40px] focus:outline-none"
                        placeholder={t("typeMessage")}
                        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                        value={message}
                        onChange={handleMessageChange}
                        maxLength={MaxCharactersInTextMessage}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    ></textarea>
                    {/* <small className="counter absolute hidden md:block  right-5 bottom-2 text-xs text-gray-500">
                        {message.length}/{MaxCharactersInTextMessage}
                    </small> */}

                    <small className="counter text-xs description_color w-full text-right mr-5">
                        {message.length}/{MaxCharactersInTextMessage}
                    </small>
                </div>
                <button 
                    onClick={handleSend} 
                    className='md:h-10 md:w-10 h-8 w-8 flex items-center justify-center rounded-lg primary_bg_color text-white'
                    disabled={isSending}
                >
                    {isSending ? <MiniLoader /> : <RiSendPlaneFill />}
                </button>
            </div>
        </div>
    );
};

export default ChatInput; 