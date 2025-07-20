import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { homeIcon, providersIcon, servicesIcon, loginIcon, userIcon } from '../ReUseableComponents/Error/Images'
import LoginModal from '../auth/LoginModal'
import { useTranslation } from './TranslationContext'
import { isLogin } from '@/utils/Helper'
import EditProfileModal from '../auth/EditProfile'

const BottomNavigation = () => {
    const t = useTranslation();
    const router = useRouter();
    const isLoggedIn = isLogin();
    const currentPath = router.pathname;
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [openProfileModal, setOpenProfileModal] = useState(false);



    // Base navigation links
    const baseNavLinks = [
        {
            icon: homeIcon(),
            text: t('home'),
            link: '/'
        },
        {
            icon: providersIcon(),
            text: t('providers'),
            link: '/providers'
        },
        {
            icon: servicesIcon(),
            text: t('services'),
            link: '/services'
        }
    ];

    // Add the last nav item based on login status
    const navLinks = [
        ...baseNavLinks,
        isLoggedIn ? {
            icon: loginIcon(), // Make sure to import userIcon
            text: t('profile'),
            link: '/profile'
        } : {
            icon: loginIcon(),
            text: t('login'),
            link: '/login'
        }
    ];

    const handleNavClick = (link) => {
        if (link === '/login' && !isLoggedIn) {
            setLoginModalOpen(true);
            return false; // Prevent default navigation
        }
        return true; // Allow navigation
    };

    return (
        <>
            <div className='fixed bottom-0 left-0 right-0 grid grid-cols-4 gap-4 w-full card_bg h-[64px] text-[10px] font-normal z-10 md:hidden'>
                {navLinks.map((nav, index) => {
                    const isActive =
                        nav.link === '/'
                            ? currentPath === '/'
                            : currentPath.startsWith(nav.link);

                    return (
                        <Link
                            href={nav.link}
                            key={index}
                            onClick={(e) => {
                                if (!handleNavClick(nav.link)) {
                                    e.preventDefault();
                                }
                            }}
                            className={`flex flex-col items-center gap-1 m-auto ${isActive ? 'primary_text_color font-medium' : 'text-gray-500'
                                }`}
                        >
                            <div className={`flex items-center justify-center  ${isActive ? 'bottom_nav_icon' : 'bottom_nav_icon_white'}`}>
                                {nav?.icon}
                            </div>
                            <p>{nav.text}</p>
                        </Link>
                    );
                })}
            </div>

            {/* Login Modal */}
            {isLoginModalOpen && (
                <LoginModal
                    open={isLoginModalOpen}
                    close={() => setLoginModalOpen(false)}
                    setOpenProfileModal={setOpenProfileModal}
                />
            )}
            {openProfileModal && (
                <EditProfileModal
                    open={openProfileModal}
                    close={() => setOpenProfileModal(false)}
                    isEditProfile={false}
                    
                />
            )}
        </>
    )
}

export default BottomNavigation