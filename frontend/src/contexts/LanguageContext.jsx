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
        // Heritage sites section translations
        heritageSites: {
            title: 'Explore Heritage Sites',
            subtitle: 'Discover Rwanda\'s rich cultural heritage through our comprehensive collection of historical sites, museums, and cultural landmarks.',
            seeMore: 'See More',
            exploreDetails: 'Explore Details',
            learnMore: 'Learn More',
            viewDetails: 'View Details',
            discoverSite: 'Discover Site',
            viewAll: 'View All Heritage Sites',
            loadingError: 'Unable to Load Heritage Sites',
            loadingErrorMessage: 'We encountered an issue while loading the heritage sites. Please try again later.',
            tryAgain: 'Try Again',
            new: 'New',
            unknown: 'Unknown'
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
        // Educational Content translations
        education: {
            title: 'Educational Content',
            subtitle: 'Learn about Rwanda\'s rich cultural heritage',
            description: 'Explore articles, take quizzes, and expand your knowledge about Rwanda\'s cultural heritage.',
            readMore: 'Read More',
            takeQuiz: 'Take Quiz',
            viewAll: 'View All',
            noContent: 'No content available',
            loading: 'Loading educational content...',
            error: 'Error loading content',
            readArticle: 'Read Article',
            untitledArticle: 'Untitled Article',
            untitledQuiz: 'Untitled Quiz',
            noContentAvailable: 'No content available',
            unableToLoadContent: 'Unable to Load Educational Content',
            noContentAvailableMessage: 'We encountered an issue while loading the educational articles.',
            noContentAvailableEmpty: 'No Educational Content Available',
            noContentAvailableEmptyMessage: 'Check back later for new educational articles and quizzes.',
            tryAgain: 'Try Again',
            categories: {
                heritageSites: 'Heritage Sites',
                traditionalCrafts: 'Traditional Crafts',
                culturalPractices: 'Cultural Practices',
                historicalEvents: 'Historical Events',
                royalHistory: 'Royal History',
                traditionalMusic: 'Traditional Music',
                architecture: 'Architecture',
                customsTraditions: 'Customs & Traditions',
                generalEducation: 'General Education'
            },
            difficultyLevels: {
                beginner: 'Beginner',
                intermediate: 'Intermediate',
                advanced: 'Advanced'
            }
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
            overview: 'Overview',
            aboutThisSite: 'About This Site',
            historicalSignificance: 'Historical Significance',
            contactInformation: 'Contact Information',
            visitingInfo: 'Visiting Info',
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
            viewMap: 'View Map',
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
            visitingHours: 'Visiting Hours',
            regularHours: 'Regular Hours',
            admissionFee: 'Admission Fee',
            established: 'Established',
            openNow: 'Open Now',
            weekendHours: 'Weekend Hours',
            closed: 'Closed',
            notSpecified: 'Not specified',
            coordinatesCopied: 'Coordinates copied to clipboard!',
            loadingSiteDetails: 'Loading site details...',
            siteNotFound: 'Site Not Found',
            unableToLoadSite: 'Unable to Load Site Details',
            goBack: 'Go Back',
            goHome: 'Go Home',
            tryAgain: 'Try Again',
            language: 'Language',
            facilitiesAndServices: 'Facilities & Services',
            mondayToFriday: 'Monday - Friday',
            saturday: 'Saturday',
            sunday: 'Sunday',
            monToFri: 'Mon-Fri',
            free: 'Free',
            notAvailable: 'Not available',
            unknown: 'Unknown',
            noImageAvailable: 'No image available',
            // Artifacts tab translations
            artifacts: 'Artifacts',
            artifactsCollection: 'Artifacts Collection',
            artifactsDescription: 'Explore the rich collection of cultural artifacts associated with this heritage site. Each artifact tells a unique story about Rwanda\'s cultural heritage and traditions.',
            collectionStatistics: 'Collection Statistics',
            totalArtifacts: 'Total Artifacts',
            authenticated: 'Authenticated',
            pending: 'Pending',
            rejected: 'Rejected',
            viewAllArtifacts: 'View All Artifacts',
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
        },
        // Report Builder translations
        reportBuilder: {
            title: 'Report Builder',
            subtitle: 'Generate comprehensive system reports with custom filters',
            generatePdfReport: 'Generate PDF Report',
            generatingPdf: 'Generating PDF...',
            generating: 'Generating...',
            accessDenied: 'Access Denied',
            accessDeniedMessage: 'Only system administrators can access this page.',
            reportBuilder: 'Report Builder',
            templates: 'Templates',
            results: 'Results',
            dateRange: 'Date Range',
            startDate: 'Start Date',
            endDate: 'End Date',
            userRoles: 'User Roles',
            siteStatuses: 'Site Statuses',
            contentTypes: 'Content Types',
            artifactAuthStatus: 'Artifact Authentication Status',
            mediaTypes: 'Media Types',
            noUserRoles: 'No user roles available',
            noSiteStatuses: 'No site statuses available',
            noContentTypes: 'No content types available',
            noAuthStatuses: 'No authentication statuses available',
            noMediaTypes: 'No media types available',
            useTemplate: 'Use Template',
            reportStatus: 'Report Status',
            reportGeneratedSuccess: 'PDF Report Generated Successfully!',
            reportDownloaded: 'Your report has been downloaded automatically',
            checkDownloads: 'Check your downloads folder for the PDF file',
            whatsInReport: 'What\'s in Your PDF Report',
            reportFeatures: [
                'Heritage logo and platform title',
                'Report generation date and filters applied',
                'Summary counts of all data categories',
                'Detailed tables with all your data'
            ],
            generateReportToSee: 'Generate a report to see results here'
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
        // Heritage sites section translations
        heritageSites: {
            title: 'Explorer les Sites du Patrimoine',
            subtitle: 'Découvrez le riche patrimoine culturel du Rwanda à travers notre collection complète de sites historiques, musées et monuments culturels.',
            seeMore: 'Voir Plus',
            exploreDetails: 'Explorer les Détails',
            learnMore: 'En Savoir Plus',
            viewDetails: 'Voir les Détails',
            discoverSite: 'Découvrir le Site',
            viewAll: 'Voir Tous les Sites du Patrimoine',
            loadingError: 'Impossible de Charger les Sites du Patrimoine',
            loadingErrorMessage: 'Nous avons rencontré un problème lors du chargement des sites du patrimoine. Veuillez réessayer plus tard.',
            tryAgain: 'Réessayer',
            new: 'Nouveau',
            unknown: 'Inconnu'
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
        // Educational Content translations
        education: {
            title: 'Contenu Éducatif',
            subtitle: 'Apprenez sur le riche patrimoine culturel du Rwanda',
            description: 'Explorez des articles, passez des quiz et développez vos connaissances sur le patrimoine culturel du Rwanda.',
            readMore: 'Lire Plus',
            takeQuiz: 'Passer le Quiz',
            viewAll: 'Voir Tout',
            noContent: 'Aucun contenu disponible',
            loading: 'Chargement du contenu éducatif...',
            error: 'Erreur de chargement du contenu',
            readArticle: 'Lire l\'Article',
            untitledArticle: 'Article Sans Titre',
            untitledQuiz: 'Quiz Sans Titre',
            noContentAvailable: 'Aucun contenu disponible',
            unableToLoadContent: 'Impossible de Charger le Contenu Éducatif',
            noContentAvailableMessage: 'Nous avons rencontré un problème lors du chargement des articles éducatifs.',
            noContentAvailableEmpty: 'Aucun Contenu Éducatif Disponible',
            noContentAvailableEmptyMessage: 'Revenez plus tard pour de nouveaux articles et quiz éducatifs.',
            tryAgain: 'Réessayer',
            categories: {
                heritageSites: 'Sites du Patrimoine',
                traditionalCrafts: 'Artisanat Traditionnel',
                culturalPractices: 'Pratiques Culturelles',
                historicalEvents: 'Événements Historiques',
                royalHistory: 'Histoire Royale',
                traditionalMusic: 'Musique Traditionnelle',
                architecture: 'Architecture',
                customsTraditions: 'Coutumes et Traditions',
                generalEducation: 'Éducation Générale'
            },
            difficultyLevels: {
                beginner: 'Débutant',
                intermediate: 'Intermédiaire',
                advanced: 'Avancé'
            }
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
            overview: 'Aperçu',
            aboutThisSite: 'À propos de ce Site',
            historicalSignificance: 'Signification Historique',
            contactInformation: 'Informations de Contact',
            visitingInfo: 'Informations de Visite',
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
            viewMap: 'Voir la Carte',
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
            visitingHours: 'Heures de Visite',
            regularHours: 'Heures Régulières',
            admissionFee: 'Frais d\'Admission',
            established: 'Établi',
            openNow: 'Ouvert Maintenant',
            weekendHours: 'Heures du Weekend',
            closed: 'Fermé',
            notSpecified: 'Non spécifié',
            coordinatesCopied: 'Coordonnées copiées dans le presse-papiers !',
            loadingSiteDetails: 'Chargement des détails du site...',
            siteNotFound: 'Site Non Trouvé',
            unableToLoadSite: 'Impossible de Charger les Détails du Site',
            goBack: 'Retour',
            goHome: 'Accueil',
            tryAgain: 'Réessayer',
            language: 'Langue',
            facilitiesAndServices: 'Installations et Services',
            mondayToFriday: 'Lundi - Vendredi',
            saturday: 'Samedi',
            sunday: 'Dimanche',
            monToFri: 'Lun-Ven',
            free: 'Gratuit',
            notAvailable: 'Non disponible',
            unknown: 'Inconnu',
            noImageAvailable: 'Aucune image disponible',
            // Artifacts tab translations
            artifacts: 'Artefacts',
            artifactsCollection: 'Collection d\'Artefacts',
            artifactsDescription: 'Explorez la riche collection d\'artefacts culturels associés à ce site du patrimoine. Chaque artefact raconte une histoire unique sur le patrimoine culturel et les traditions du Rwanda.',
            collectionStatistics: 'Statistiques de la Collection',
            totalArtifacts: 'Total des Artefacts',
            authenticated: 'Authentifié',
            pending: 'En Attente',
            rejected: 'Rejeté',
            viewAllArtifacts: 'Voir Tous les Artefacts',
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
        },
        // Report Builder translations
        reportBuilder: {
            title: 'Générateur de Rapports',
            subtitle: 'Générer des rapports système complets avec des filtres personnalisés',
            generatePdfReport: 'Générer un Rapport PDF',
            generatingPdf: 'Génération du PDF...',
            generating: 'Génération...',
            accessDenied: 'Accès Refusé',
            accessDeniedMessage: 'Seuls les administrateurs système peuvent accéder à cette page.',
            reportBuilder: 'Générateur de Rapports',
            templates: 'Modèles',
            results: 'Résultats',
            dateRange: 'Plage de Dates',
            startDate: 'Date de Début',
            endDate: 'Date de Fin',
            userRoles: 'Rôles Utilisateur',
            siteStatuses: 'Statuts de Site',
            contentTypes: 'Types de Contenu',
            artifactAuthStatus: 'Statut d\'Authentification d\'Artefact',
            mediaTypes: 'Types de Média',
            noUserRoles: 'Aucun rôle utilisateur disponible',
            noSiteStatuses: 'Aucun statut de site disponible',
            noContentTypes: 'Aucun type de contenu disponible',
            noAuthStatuses: 'Aucun statut d\'authentification disponible',
            noMediaTypes: 'Aucun type de média disponible',
            useTemplate: 'Utiliser le Modèle',
            reportStatus: 'Statut du Rapport',
            reportGeneratedSuccess: 'Rapport PDF Généré avec Succès!',
            reportDownloaded: 'Votre rapport a été téléchargé automatiquement',
            checkDownloads: 'Vérifiez votre dossier de téléchargements pour le fichier PDF',
            whatsInReport: 'Que Contient Votre Rapport PDF',
            reportFeatures: [
                'Logo du patrimoine et titre de la plateforme',
                'Date de génération du rapport et filtres appliqués',
                'Comptes récapitulatifs de toutes les catégories de données',
                'Tableaux détaillés avec toutes vos données'
            ],
            generateReportToSee: 'Générez un rapport pour voir les résultats ici'
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
        // Heritage sites section translations
        heritageSites: {
            title: 'Sura mu Ahantu h\'Umurage',
            subtitle: 'Menya umurage ukomeye w\'umuco w\'u Rwanda binyuze mu rukurikirane rwacu rwuzuye rw\'ahantu h\'amateka, inzu ndangamurage n\'ibimenyetso by\'umuco.',
            seeMore: 'Reba Byinshi',
            exploreDetails: 'Sura mu Bisobanura',
            learnMore: 'Menya Byinshi',
            viewDetails: 'Reba Ibisobanura',
            discoverSite: 'Shakisha Ahantu',
            viewAll: 'Reba Ahantu Hosi h\'Umurage',
            loadingError: 'Ntibishoboka Ko Kujyana mu Ahantu h\'Umurage',
            loadingErrorMessage: 'Twahura n\'ikibazo iyo dukujyana mu ahantu h\'umurage. Ongera ugerageze nyuma.',
            tryAgain: 'Ongera Ugerageze',
            new: 'Gishya',
            unknown: 'Ntibizwi'
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
        // Educational Content translations
        education: {
            title: 'Ibintu by\'Uburezi',
            subtitle: 'Menya ibyerekeye umurage ukomeye w\'umuco w\'u Rwanda',
            description: 'Sura mu nyandiko, gerageza quiz kandi urambuye ubumenyi bwawe ibyerekeye umurage w\'umuco w\'u Rwanda.',
            readMore: 'Soma Ibindi',
            takeQuiz: 'Gerageza Quiz',
            viewAll: 'Reba Byose',
            noContent: 'Nta kintu kihagaze',
            loading: 'Kubika ibintu by\'uburezi...',
            error: 'Ikibazo mu kubika ibintu',
            readArticle: 'Soma Inyandiko',
            untitledArticle: 'Inyandiko Itagira Izina',
            untitledQuiz: 'Quiz Itagira Izina',
            noContentAvailable: 'Nta kintu kihagaze',
            unableToLoadContent: 'Ntibishoboka Kubika Ibintu by\'Uburezi',
            noContentAvailableMessage: 'Twahuye n\'ikibazo iyo tubika inyandiko z\'uburezi.',
            noContentAvailableEmpty: 'Nta Kintu cy\'Uburezi Kihagaze',
            noContentAvailableEmptyMessage: 'Subira nyuma kugira ngo ubone inyandiko n\'amagambo mashya y\'uburezi.',
            tryAgain: 'Ongera Ugerageze',
            categories: {
                heritageSites: 'Ahantu h\'Umurage',
                traditionalCrafts: 'Ubumenyi bwo Gukora Ibintu',
                culturalPractices: 'Imikorere y\'Umuco',
                historicalEvents: 'Ibikorwa by\'Amateka',
                royalHistory: 'Amateka y\'Ubwami',
                traditionalMusic: 'Umuziki wa Kera',
                architecture: 'Ubwubatsi',
                customsTraditions: 'Imikorere n\'Imigenzirire',
                generalEducation: 'Uburezi Rusange'
            },
            difficultyLevels: {
                beginner: 'Umutangizi',
                intermediate: 'Umunyabumenyi',
                advanced: 'Umwuga'
            }
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
            overview: 'Inyandiko y\'Igenamiterere',
            aboutThisSite: 'Ibyerekeye iyi Ntara',
            historicalSignificance: 'Akamaro ko mu Mateka',
            contactInformation: 'Amakuru yo Guhuza',
            visitingInfo: 'Amakuru yo Gushyira',
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
            viewMap: 'Reba Ikarita',
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
            visitingHours: 'Amasaha yo Gushyira',
            regularHours: 'Amasaha y\'Umunsi',
            admissionFee: 'Amafaranga yo Gushyira',
            established: 'Byashyizwemo',
            openNow: 'Bihagaze Ubu',
            weekendHours: 'Amasaha y\'Icyumweru',
            closed: 'Bifungye',
            notSpecified: 'Ntibivugwa',
            coordinatesCopied: 'Ibihamya by\'ahantu byakopiwe!',
            loadingSiteDetails: 'Kubika amakuru y\'ahantu...',
            siteNotFound: 'Ahantu Ntihabashije Gushakishwa',
            unableToLoadSite: 'Ntibishoboka Kubika Amakuru y\'Ahantu',
            goBack: 'Subira Inyuma',
            goHome: 'Jya Mu Ntangiriro',
            tryAgain: 'Ongera Ugerageze',
            language: 'Ururimi',
            facilitiesAndServices: 'Ibikoresho n\'Umutekano',
            mondayToFriday: 'Kuwa Mbere - Kuwa Gatanu',
            saturday: 'Kuwa Mande',
            sunday: 'Kuwa Mungu',
            monToFri: 'Mbe-Gat',
            free: 'Ubuntu',
            notAvailable: 'Ntibihagaze',
            unknown: 'Ntibizwi',
            noImageAvailable: 'Nta ifoto ihagaze',
            // Artifacts tab translations
            artifacts: 'Ibintu by\'Umurage',
            artifactsCollection: 'Ibintu by\'Umurage Bihagaze',
            artifactsDescription: 'Shakisha ibintu by\'umurage by\'umuco by\'umwihariko bihagaze kuri iyi ntara. Buri kintu gisobanura inkuru y\'umwihariko ku murage w\'umuco w\'u Rwanda n\'imigenzirire.',
            collectionStatistics: 'Imibare y\'Ibintu Bihagaze',
            totalArtifacts: 'Ibintu Byose Bihagaze',
            authenticated: 'Byemejwe',
            pending: 'Biteganyijwe',
            rejected: 'Byanzejwe',
            viewAllArtifacts: 'Reba Ibintu Byose Bihagaze',
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
        },
        // Report Builder translations
        reportBuilder: {
            title: 'Umubare w\'Ingingo',
            subtitle: 'Kora umubare w\'umuryango wuzuye ufite ibihuzo byihariye',
            generatePdfReport: 'Kora Umubare wa PDF',
            generatingPdf: 'Kora PDF...',
            generating: 'Kora...',
            accessDenied: 'Ntibyemewe',
            accessDeniedMessage: 'Abakora umuryango gusa ni bo bashobora kujya kuri iyi urubuga.',
            reportBuilder: 'Umubare w\'Ingingo',
            templates: 'Ibihuzo',
            results: 'Ibisubizo',
            dateRange: 'Urukurikirane rw\'Itariki',
            startDate: 'Itariki yo Gutangira',
            endDate: 'Itariki yo Kurangira',
            userRoles: 'Ibikorwa by\'Umukoresha',
            siteStatuses: 'Imimerere y\'Ahantu',
            contentTypes: 'Ubwoko bw\'Ibikubiyemo',
            artifactAuthStatus: 'Imimerere yo Kwemeza Ibintu by\'Umuco',
            mediaTypes: 'Ubwoko bw\'Itangazamakuru',
            noUserRoles: 'Nta bikorwa by\'umukoresha bihagaze',
            noSiteStatuses: 'Nta mimerere y\'ahantu ihagaze',
            noContentTypes: 'Nta bwoko bw\'ibikubiyemo buhagaze',
            noAuthStatuses: 'Nta mimerere yo kwemeza ihagaze',
            noMediaTypes: 'Nta bwoko bw\'itangazamakuru buhagaze',
            useTemplate: 'Koresha Ibihuzo',
            reportStatus: 'Imimerere y\'Umubare',
            reportGeneratedSuccess: 'Umubare wa PDF Wakozwe neza!',
            reportDownloaded: 'Umubare wawe wakujyana mu buryo bwa nyuma',
            checkDownloads: 'Reba mu buryo bwa nyuma kugira ngo ubone fayilo ya PDF',
            whatsInReport: 'Iki Kiri mu Mubare wawe wa PDF',
            reportFeatures: [
                'Ikimenyetso cy\'umurage n\'umutekano w\'urubuga',
                'Itariki yo gucapa umubare n\'ibihuzo byakoreshejwe',
                'Umubare w\'ibintu byose by\'uburyo',
                'Imbonerahamwe zuzuye n\'amakuru yawe yose'
            ],
            generateReportToSee: 'Kora umubare kugira ngo ubone ibisubizo hano'
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
