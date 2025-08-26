import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

const translations = {
    en: {
        // Navigation translations
        nav: {
            heritageSites: 'Heritage Sites',
            education: 'Education',
            artifacts: 'Artifacts',
            community: 'Community',
            login: 'Login',
            register: 'Register',
            dashboard: 'Dashboard',
            searchPlaceholder: 'Search heritage sites...'
        },
        // Hero section translations
        hero: {
            title: 'Preserving Rwanda\'s Cultural Heritage',
            subtitle: 'Discover, document, and preserve Rwanda\'s rich cultural heritage through digital innovation and community collaboration.',
            searchPlaceholder: 'Search heritage sites, artifacts, and more...',
            exploreSites: 'Explore Sites',
            joinCommunity: 'Join Community',
            stats: {
                sites: 'Heritage Sites',
                documents: 'Documents',
                members: 'Community Members',
                articles: 'Educational Articles'
            }
        },
        // Call-to-action translations
        cta: {
            title: 'Join the Heritage Preservation Movement',
            subtitle: 'Be part of preserving Rwanda\'s cultural legacy for future generations',
            primaryButton: 'Get Started',
            secondaryButton: 'Learn More',
            dashboardButton: 'Go to Dashboard',
            features: [
                {
                    icon: 'Search',
                    title: 'Discover Heritage',
                    description: 'Explore Rwanda\'s rich cultural heritage'
                },
                {
                    icon: 'Users',
                    title: 'Join Community',
                    description: 'Connect with heritage enthusiasts'
                },
                {
                    icon: 'BookOpen',
                    title: 'Learn & Share',
                    description: 'Access educational resources'
                },
                {
                    icon: 'Heart',
                    title: 'Preserve Culture',
                    description: 'Help document and protect heritage'
                }
            ],
            additionalInfo: 'Join thousands of heritage enthusiasts preserving Rwanda\'s cultural legacy'
        },
        artifacts: {
            title: 'Artifact Documentation & Authentication',
            subtitle: 'Professional documentation and authentication of cultural artifacts',
            viewGallery: 'View Artifact Gallery'
        },
        community: {
            title: 'Join Our Heritage Community',
            subtitle: 'Connect with heritage enthusiasts, experts, and researchers',
            cta: 'Be Part of the Movement',
            ctaSub: 'Join thousands of heritage enthusiasts preserving Rwanda\'s cultural legacy',
            joinBtn: 'Join Our Heritage Community',
            dashboardBtn: 'Go to Dashboard',
            signInBtn: 'Already a Member? Sign In'
        },
        siteDetails: {
            backToSites: 'Back to Sites',
            editSite: 'Edit Site',
            deleteSite: 'Delete Site',
            addedToSystem: 'Added to System',
            ancient: 'Ancient',
            aboutThisSite: 'About This Site',
            historicalSignificance: 'Historical Significance',
            contactInformation: 'Contact Information',
            siteStatus: 'Site Status',
            currentStatus: 'Current Status',
            ownership: 'Ownership',
            siteInformation: 'Site Information',
            category: 'Category',
            region: 'Region',
            coordinates: 'Coordinates',
            address: 'Address',
            contactInfo: 'Contact Info',
            copy: 'Copy',
            photoGallery: 'Photo Gallery',
            addMedia: 'Add Media',
            mediaFiles: 'media file',
            mediaFilesPlural: 'media files',
            clickToViewFullSize: 'Click to view full size',
            noPhotosAvailable: 'No photos available for this site',
            mediaFilesWillAppearHere: 'Media files will appear here once uploaded',
            photographer: 'Photographer',
            dateTaken: 'Date Taken',
            actions: 'Actions',
            view: 'View',
            edit: 'Edit',
            delete: 'Delete',
            active: 'Active',
            inactive: 'Inactive',
            underMaintenance: 'Under Maintenance',
            closed: 'Closed',
            archived: 'Archived',
            public: 'Public',
            private: 'Private',
            community: 'Community',
            government: 'Government',
            mixed: 'Mixed',
            unknown: 'Unknown',
            // Site categories
            museum: 'Museum',
            historical_site: 'Historical Site',
            archaeological_site: 'Archaeological Site',
            cultural_landscape: 'Cultural Landscape',
            natural_heritage: 'Natural Heritage',
            intangible_heritage: 'Intangible Heritage',
            other: 'Other',
            // Regions
            northern: 'Northern Province',
            southern: 'Southern Province',
            eastern: 'Eastern Province',
            western: 'Western Province',
            kigali: 'Kigali City'
        },
        footer: {
            logoAlt: 'HeritageGuard Logo',
            brandName: 'HeritageGuard',
            description: 'Preserving Rwanda\'s cultural heritage through technology and community collaboration.',
            quickLinks: [
                { name: 'Home', path: '/' },
                { name: 'Sites', path: '/sites' },
                { name: 'Artifacts', path: '/artifacts' },
                { name: 'Education', path: '/education' },
                { name: 'Forum', path: '/forum' },
                { name: 'About', path: '/about' }
            ],
            legalLinks: [
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms of Service', path: '/terms' },
                { name: 'Cookie Policy', path: '/cookies' },
                { name: 'Contact', path: '/contact' }
            ],
            contactInfo: {
                email: 'info@heritageguard.rw',
                phone: '+250 788 123 456',
                address: 'Kigali, Rwanda',
                languages: [
                    { code: 'en', name: 'English' },
                    { code: 'rw', name: 'Kinyarwanda' },
                    { code: 'fr', name: 'Français' }
                ]
            }
        }
    },
    fr: {
        // Navigation translations
        nav: {
            heritageSites: 'Sites du Patrimoine',
            education: 'Éducation',
            artifacts: 'Artéfacts',
            community: 'Communauté',
            login: 'Connexion',
            register: 'S\'inscrire',
            dashboard: 'Tableau de Bord',
            searchPlaceholder: 'Rechercher des sites du patrimoine...'
        },
        // Hero section translations
        hero: {
            title: 'Préserver le Patrimoine Culturel du Rwanda',
            subtitle: 'Découvrez, documentez et préservez le riche patrimoine culturel du Rwanda grâce à l\'innovation numérique et à la collaboration communautaire.',
            searchPlaceholder: 'Rechercher des sites patrimoniaux, artéfacts et plus...',
            exploreSites: 'Explorer les Sites',
            joinCommunity: 'Rejoindre la Communauté',
            stats: {
                sites: 'Sites du Patrimoine',
                documents: 'Documents',
                members: 'Membres de la Communauté',
                articles: 'Articles Éducatifs'
            }
        },
        // Call-to-action translations
        cta: {
            title: 'Rejoignez le Mouvement de Préservation du Patrimoine',
            subtitle: 'Participez à la préservation de l\'héritage culturel du Rwanda pour les générations futures',
            primaryButton: 'Commencer',
            secondaryButton: 'En Savoir Plus',
            dashboardButton: 'Aller au Tableau de Bord',
            features: [
                {
                    icon: 'Search',
                    title: 'Découvrir le Patrimoine',
                    description: 'Explorez le riche patrimoine culturel du Rwanda'
                },
                {
                    icon: 'Users',
                    title: 'Rejoindre la Communauté',
                    description: 'Connectez-vous avec les passionnés du patrimoine'
                },
                {
                    icon: 'BookOpen',
                    title: 'Apprendre et Partager',
                    description: 'Accédez aux ressources éducatives'
                },
                {
                    icon: 'Heart',
                    title: 'Préserver la Culture',
                    description: 'Aidez à documenter et protéger le patrimoine'
                }
            ],
            additionalInfo: 'Rejoignez des milliers de passionnés préservant l\'héritage culturel du Rwanda'
        },
        artifacts: {
            title: 'Documentation et Authentification d\'Artéfacts',
            subtitle: 'Documentation professionnelle et authentification d\'artéfacts culturels',
            viewGallery: 'Voir la Galerie d\'Artéfacts'
        },
        community: {
            title: 'Rejoignez Notre Communauté du Patrimoine',
            subtitle: 'Connectez-vous avec les passionnés du patrimoine, les experts et les chercheurs',
            cta: 'Faites Partie du Mouvement',
            ctaSub: 'Rejoignez des milliers de passionnés du patrimoine préservant l\'héritage culturel du Rwanda',
            joinBtn: 'Rejoignez Notre Communauté du Patrimoine',
            dashboardBtn: 'Aller au Tableau de Bord',
            signInBtn: 'Déjà Membre? Se Connecter'
        },
        siteDetails: {
            backToSites: 'Retour aux Sites',
            editSite: 'Modifier le Site',
            deleteSite: 'Supprimer le Site',
            addedToSystem: 'Ajouté au Système',
            ancient: 'Ancien',
            aboutThisSite: 'À propos de ce Site',
            historicalSignificance: 'Signification Historique',
            contactInformation: 'Informations de Contact',
            siteStatus: 'Statut du Site',
            currentStatus: 'Statut Actuel',
            ownership: 'Propriété',
            siteInformation: 'Informations du Site',
            category: 'Catégorie',
            region: 'Région',
            coordinates: 'Coordonnées',
            address: 'Adresse',
            contactInfo: 'Informations de Contact',
            copy: 'Copier',
            photoGallery: 'Galerie Photos',
            addMedia: 'Ajouter des Médias',
            mediaFiles: 'fichier média',
            mediaFilesPlural: 'fichiers médias',
            clickToViewFullSize: 'Cliquez pour voir en taille réelle',
            noPhotosAvailable: 'Aucune photo disponible pour ce site',
            mediaFilesWillAppearHere: 'Les fichiers médias apparaîtront ici une fois téléchargés',
            photographer: 'Photographe',
            dateTaken: 'Date de Prise',
            actions: 'Actions',
            view: 'Voir',
            edit: 'Modifier',
            delete: 'Supprimer',
            active: 'Actif',
            inactive: 'Inactif',
            underMaintenance: 'En Maintenance',
            closed: 'Fermé',
            archived: 'Archivé',
            public: 'Public',
            private: 'Privé',
            community: 'Communauté',
            government: 'Gouvernement',
            mixed: 'Mixte',
            unknown: 'Inconnu',
            // Site categories
            museum: 'Musée',
            historical_site: 'Site Historique',
            archaeological_site: 'Site Archéologique',
            cultural_landscape: 'Paysage Culturel',
            natural_heritage: 'Patrimoine Naturel',
            intangible_heritage: 'Patrimoine Immatériel',
            other: 'Autre',
            // Regions
            northern: 'Province du Nord',
            southern: 'Province du Sud',
            eastern: 'Province de l\'Est',
            western: 'Province de l\'Ouest',
            kigali: 'Ville de Kigali'
        },
        footer: {
            logoAlt: 'Logo HeritageGuard',
            brandName: 'HeritageGuard',
            description: 'Préserver le patrimoine culturel du Rwanda grâce à la technologie et à la collaboration communautaire.',
            quickLinks: [
                { name: 'Accueil', path: '/' },
                { name: 'Sites', path: '/sites' },
                { name: 'Artéfacts', path: '/artifacts' },
                { name: 'Éducation', path: '/education' },
                { name: 'Forum', path: '/forum' },
                { name: 'À propos', path: '/about' }
            ],
            legalLinks: [
                { name: 'Politique de Confidentialité', path: '/privacy' },
                { name: 'Conditions d\'Utilisation', path: '/terms' },
                { name: 'Politique des Cookies', path: '/cookies' },
                { name: 'Contact', path: '/contact' }
            ],
            contactInfo: {
                email: 'info@heritageguard.rw',
                phone: '+250 788 123 456',
                address: 'Kigali, Rwanda',
                languages: [
                    { code: 'en', name: 'English' },
                    { code: 'rw', name: 'Kinyarwanda' },
                    { code: 'fr', name: 'Français' }
                ]
            }
        }
    },
    rw: {
        // Navigation translations
        nav: {
            heritageSites: 'Ahantu by\'Umurage',
            education: 'Uburezi',
            artifacts: 'Ibintu by\'Umuco',
            community: 'Umuryango',
            login: 'Kwinjira',
            register: 'Kwiyandikisha',
            dashboard: 'Ikibaho',
            searchPlaceholder: 'Shakisha ahantu h\'umurage...'
        },
        // Hero section translations
        hero: {
            title: 'Kubungabunga Umurage w\'Umuco w\'u Rwanda',
            subtitle: 'Menya, wandika kandi ubungabunge umurage ukomeye w\'umuco w\'u Rwanda binyuze mu koranabuhanga n\'ubufatanye bw\'umuryango.',
            searchPlaceholder: 'Shakisha ahantu h\'umurage, ibintu by\'umuco n\'ibindi...',
            exploreSites: 'Sura mu Hantu',
            joinCommunity: 'Jyana n\'Umuryango',
            stats: {
                sites: 'Ahantu h\'Umurage',
                documents: 'Inyandiko',
                members: 'Abanyamuryango',
                articles: 'Ingingo z\'Uburezi'
            }
        },
        // Call-to-action translations
        cta: {
            title: 'Jyana mu Bikorwa byo Kubungabunga Umurage',
            subtitle: 'Ba umwe mu bangabunga umurage w\'umuco w\'u Rwanda ku buzazi bugaruka',
            primaryButton: 'Tangira',
            secondaryButton: 'Menya Byinshi',
            dashboardButton: 'Jya ku Kibaho',
            features: [
                {
                    icon: 'Search',
                    title: 'Shakisha Umurage',
                    description: 'Sura mu murage ukomeye w\'umuco w\'u Rwanda'
                },
                {
                    icon: 'Users',
                    title: 'Jyana n\'Umuryango',
                    description: 'Huza n\'abakunda umurage'
                },
                {
                    icon: 'BookOpen',
                    title: 'Wige kandi Usangire',
                    description: 'Koresha ibikoresho by\'uburezi'
                },
                {
                    icon: 'Heart',
                    title: 'Bungabunga Umuco',
                    description: 'Fasha mu kwandika no kurinda umurage'
                }
            ],
            additionalInfo: 'Jyana n\'abantu benshi babungabunga umurage w\'umuco w\'u Rwanda'
        },
        artifacts: {
            title: 'Kwandika no Kwemeza Ibintu by\'Umuco',
            subtitle: 'Kwandika no kwemeza ibintu by\'umuco mu buryo bw\'abakomeye',
            viewGallery: 'Reba Ibintu by\'Umuco'
        },
        community: {
            title: 'Jyana nacu mu muryango w\'umurage',
            subtitle: 'Huza n\'abakunda umurage, abakomeye, n\'abashakashatsi',
            cta: 'Ba Umwe mu Bikorwa',
            ctaSub: 'Jyana n\'abantu benshi bubungabunga umurage w\'umuco w\'u Rwanda',
            joinBtn: 'Jyana nacu mu muryango w\'umurage',
            dashboardBtn: 'Jya ku Kibaho',
            signInBtn: 'Umunyamuryango? Injira'
        },
        siteDetails: {
            backToSites: 'Subira ku Ahantu',
            editSite: 'Hindura Ahantu',
            deleteSite: 'Siba Ahantu',
            addedToSystem: 'Byongeyeho mu Sisitemu',
            ancient: 'Kera',
            aboutThisSite: 'Ibyerekeye iyi Ntara',
            historicalSignificance: 'Akamaro ko mu Mateka',
            contactInformation: 'Amakuru yo Guhuza',
            siteStatus: 'Uko Ahantu Hihagaze',
            currentStatus: 'Uko Hihagaze Ubu',
            ownership: 'Ubwubwabo',
            siteInformation: 'Amakuru y\'Ahantu',
            category: 'Ubwoko',
            region: 'Intara',
            coordinates: 'Ibihamya by\'Ahantu',
            address: 'Aderesi',
            contactInfo: 'Amakuru yo Guhuza',
            copy: 'Kopera',
            photoGallery: 'Ifoto z\'Ahantu',
            addMedia: 'Ongeraho Ibintu by\'Itangazamakuru',
            mediaFiles: 'fayilo y\'itangazamakuru',
            mediaFilesPlural: 'fayilo z\'itangazamakuru',
            clickToViewFullSize: 'Kanda kugira ngo urebe mu buryo bwuzuye',
            noPhotosAvailable: 'Nta foto ihagaze kuri iyi ntara',
            mediaFilesWillAppearHere: 'Fayilo z\'itangazamakuru zizagaragara hano nyuma yo ko byongeyeho',
            photographer: 'Umufotora',
            dateTaken: 'Itariki yo Gufata',
            actions: 'Ibikorwa',
            view: 'Reba',
            edit: 'Hindura',
            delete: 'Siba',
            active: 'Bikora',
            inactive: 'Ntibikora',
            underMaintenance: 'Mu Bikorwa byo Kubungabunga',
            closed: 'Bifungye',
            archived: 'Bibikwa',
            public: 'Rusange',
            private: 'Ubwubwabo',
            community: 'Umuryango',
            government: 'Leta',
            mixed: 'Byahuzwe',
            unknown: 'Ntibizwi',
            // Site categories
            museum: 'Inzu Ndangamurage',
            historical_site: 'Ahantu h\'Amateka',
            archaeological_site: 'Ahantu h\'Ubushakashatsi bw\'Amateka',
            cultural_landscape: 'Imiterere y\'Umuco',
            natural_heritage: 'Umurage w\'Ibidukikije',
            intangible_heritage: 'Umurage utaboneka',
            other: 'Ibindi',
            // Regions
            northern: 'Intara y\'Amajyaruguru',
            southern: 'Intara y\'Amajyepfo',
            eastern: 'Intara y\'Iburasirazuba',
            western: 'Intara y\'Iburengerazuba',
            kigali: 'Umujyi wa Kigali'
        },
        footer: {
            logoAlt: 'Ikimenyetso cya HeritageGuard',
            brandName: 'HeritageGuard',
            description: 'Kubungabunga umurage w\'umuco w\'u Rwanda hakoreshejwe ikoranabuhanga n\'ubufatanye bw\'umuryango.',
            quickLinks: [
                { name: 'Itangiriro', path: '/' },
                { name: 'Ahantu', path: '/sites' },
                { name: 'Ibintu by\'Umuco', path: '/artifacts' },
                { name: 'Uburezi', path: '/education' },
                { name: 'Ikiganiro', path: '/forum' },
                { name: 'Ibyerekeye', path: '/about' }
            ],
            legalLinks: [
                { name: 'Politike y\'Ubuzima bwite', path: '/privacy' },
                { name: 'Amabwiriza yo Gukoresha', path: '/terms' },
                { name: 'Politike ya Cookies', path: '/cookies' },
                { name: 'Tuvugishe', path: '/contact' }
            ],
            contactInfo: {
                email: 'info@heritageguard.rw',
                phone: '+250 788 123 456',
                address: 'Kigali, Rwanda',
                languages: [
                    { code: 'en', name: 'English' },
                    { code: 'rw', name: 'Kinyarwanda' },
                    { code: 'fr', name: 'Français' }
                ]
            }
        }
    }
};

export const LanguageProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState('en');

    const changeLanguage = (language) => {
        setCurrentLanguage(language);
    };

    // Define available languages
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'rw', name: 'Kinyarwanda' },
        { code: 'fr', name: 'Français' }
    ];

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[currentLanguage];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English if translation not found
                value = translations.en;
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object' && fallbackKey in value) {
                        value = value[fallbackKey];
                    } else {
                        return key; // Return the key if no translation found
                    }
                }
                break;
            }
        }

        return value || key;
    };

    const getTranslations = (key) => {
        const keys = key.split('.');
        let value = translations[currentLanguage];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English if translation not found
                value = translations.en;
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object' && fallbackKey in value) {
                        value = value[fallbackKey];
                    } else {
                        return {}; // Return empty object if no translation found
                    }
                }
                break;
            }
        }

        return value || {};
    };

    const value = {
        currentLanguage,
        changeLanguage,
        languages,
        t,
        getTranslations
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
