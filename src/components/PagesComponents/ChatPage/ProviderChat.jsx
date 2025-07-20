import React, { useEffect, useRef } from "react";
import { useTranslation } from '@/components/Layout/TranslationContext'
import { FaArrowLeft } from 'react-icons/fa'
import { BsThreeDotsVertical } from 'react-icons/bs'
import CustomImageTag from '@/components/ReUseableComponents/CustomImageTag'
import ChatQuestions from './ChatQuestions'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import MessageSkeleton from './MessageSkeleton';
import ChatInput from './ChatInput';

const ProviderChat = ({
    handleScroll,
    isLoading,
    chatMessages,
    attachedFiles,
    handleFileAttachment,
    message,
    handleMessageChange,
    MaxCharactersInTextMessage,
    handleSend,
    isSending,
    userData,
    renderMessage,
    selectedChatTab,
    renderFilePreview,
    handleOpenLightbox,
    blockedStatus,
    onBlock,
    onUnblock,
    onDelete,
    mobileView,
    handleBackToList
}) => {
    const t = useTranslation();
    const chatContentRef = useRef(null);

    // Auto scroll to bottom when messages change
    useEffect(() => {
        const chatScreen = document.querySelector('.chat_messages_screen');
        if (chatScreen) {
            chatScreen.scrollTop = chatScreen.scrollHeight;
        } else if (chatContentRef.current) {
            chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    }, [chatMessages?.length]);

    // Handle direct question submission (auto-send)
    const handleQuestionSubmit = async (question) => {
        const customSendEvent = {
            preventDefault: () => { },
            target: { value: question }
        };

        setTimeout(() => {
            if (selectedChatTab?.order_status !== "cancelled" && selectedChatTab?.order_status !== "completed") {
                handleSend(customSendEvent);
            }
        }, 100);
    };

    // If no chat is selected
    if (!selectedChatTab) {
        return (
            <div className="flex-1 p-4 flex items-center justify-center">
                <p className="text-gray-500">{t("pickPersonFromLeftMenu")}</p>
            </div>
        );
    }

    // Determine if we should show pre-fill messages
    const shouldShowPreFillMessages = () => {
        // Don't show if blocked
        if (blockedStatus.isBlocked) return false;

        // Show for both pre-booking and post-booking if no messages
        return chatMessages?.length === 0;
    };

    const isDisabled = selectedChatTab?.order_status === 'cancelled' || selectedChatTab?.order_status === 'completed';

    return (
        <div className='flex-1 flex flex-col'>
            {/* Desktop Header */}
            <div className='hidden md:flex p-3 items-center border-b border-gray-300 gap-3 justify-between'>
                <div className='flex items-center gap-3'>
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full shadow-sm">
                        <CustomImageTag
                            src={selectedChatTab?.image}
                            alt={selectedChatTab?.partner_name}
                            className="!h-10 !w-10 rounded-full object-cover"
                        />
                    </div>
                    <div className='flex flex-col gap-1 items-start'>
                        <h2 className='text-xl'>{selectedChatTab?.partner_name}</h2>
                        <p className='text-sm text-gray-500'>
                            {selectedChatTab?.booking_id === null
                                ? t("preBookingEnq")
                                : `${t("bookingId")}: ${selectedChatTab?.booking_id}`
                            }
                        </p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-2 hover:light_bg_color rounded-full">
                            <BsThreeDotsVertical size={20} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {!isDisabled && (
                            <DropdownMenuItem
                                onClick={blockedStatus.blockedByUser ? onUnblock : onBlock}
                                className="cursor-pointer"
                            >
                                {blockedStatus.blockedByUser ? t("unblock") : t("block&Report")}
                            </DropdownMenuItem>
                        )}
                        {chatMessages.length > 0 && (
                            <DropdownMenuItem
                                onClick={onDelete}
                                className="text-red-600 cursor-pointer"
                            >
                                {t("deleteMessages")}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Mobile Header */}
            {mobileView && (
                <div className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center gap-2">
                        <button onClick={handleBackToList} className="p-2 rounded-full hover:bg-gray-100">
                            <FaArrowLeft />
                        </button>
                        <div className="flex items-center gap-2">
                            <CustomImageTag
                                src={selectedChatTab?.image}
                                alt={selectedChatTab?.partner_name}
                                className="h-8 w-8 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="font-medium">{selectedChatTab?.partner_name}</h3>
                                {selectedChatTab?.booking_id ? (
                                    <div className="flex items-center text-xs text-gray-500">
                                        <span>{t("bookingId")}: #{selectedChatTab?.booking_id}</span>
                                        <span className="mx-1">•</span>
                                        <span>{t(selectedChatTab?.order_status)}</span>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500">{t("preBookingEnq")}</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                                <BsThreeDotsVertical size={20} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {!isDisabled && (
                                <DropdownMenuItem
                                    onClick={blockedStatus.blockedByUser ? onUnblock : onBlock}
                                    className="cursor-pointer"
                                >
                                    {blockedStatus.blockedByUser ? t("unblock") : t("block&Report")}
                                </DropdownMenuItem>
                            )}
                            {chatMessages.length > 0 && (
                                <DropdownMenuItem
                                    onClick={onDelete}
                                    className="text-red-600 cursor-pointer"
                                >
                                    {t("deleteMessages")}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Chat Messages */}
            <div ref={chatContentRef} className='flex flex-col gap-3 p-4 overflow-auto h-[430px] md:h-[600px] chatsWrapper justify-start chat_messages_screen' onScroll={handleScroll}>
            

                {isLoading ? (
                    <MessageSkeleton />
                ) : chatMessages?.length > 0 ? (
                    <div className="flex flex-col-reverse">
                        {chatMessages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${(userData?.id === message?.sender_id || userData?.id === message?.sender_details?.id) ? 'justify-end senderMsg' : 'justify-start otherMsg'}`}
                            >
                                {renderMessage(message)}
                            </div>
                        ))}
                    </div>
                ) : shouldShowPreFillMessages() ? (
                    <ChatQuestions
                        selectedChatTab={selectedChatTab}
                        onQuestionSubmit={handleQuestionSubmit}
                        isAdmin={false}
                    />
                ) : (
                    null
                )}
            </div>

            {/* Chat Input */}
            <ChatInput
                attachedFiles={attachedFiles}
                renderFilePreview={renderFilePreview}
                handleFileAttachment={handleFileAttachment}
                message={message}
                handleMessageChange={handleMessageChange}
                MaxCharactersInTextMessage={MaxCharactersInTextMessage}
                handleSend={handleSend}
                isSending={isSending}
                isDisabled={isDisabled || blockedStatus.isBlocked}
                blockedStatus={blockedStatus}
                inputId="providerFileAttachment"
            />
        </div>
    );
};

export default ProviderChat;