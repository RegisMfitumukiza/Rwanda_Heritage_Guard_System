import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleBasedRoute from '../components/auth/RoleBasedRoute';
import RouteErrorBoundary from '../components/error/RouteErrorBoundary';

// Import layout components
import { AdminLayout, HeritageManagerLayout, ContentManagerLayout, CommunityMemberLayout } from '../components/dashboard/DashboardLayout';

// Lazy load components for better performance
// Public pages (no authentication required)
const LandingPage = React.lazy(() => import('../pages/LandingPage'));
const About = React.lazy(() => import('../pages/About'));
const Contact = React.lazy(() => import('../pages/Contact'));
const PublicEducationalContent = React.lazy(() => import('../pages/PublicEducationalContent'));
const HeritageSiteDetails = React.lazy(() => import('../pages/HeritageSiteDetails'));

// Authentication pages
const Login = React.lazy(() => import('../pages/Login'));
const Register = React.lazy(() => import('../pages/Register'));
const GoogleCallback = React.lazy(() => import('../pages/GoogleCallback'));
const ForgotPassword = React.lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/ResetPassword'));
const VerifyEmail = React.lazy(() => import('../pages/VerifyEmail'));

// Dashboard components
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const AdminDashboard = React.lazy(() => import('../pages/dashboard/AdminDashboard'));
const HeritageManagerDashboard = React.lazy(() => import('../pages/dashboard/HeritageManagerDashboard'));
const ContentManagerDashboard = React.lazy(() => import('../pages/dashboard/ContentManagerDashboard'));
const CommunityMemberDashboard = React.lazy(() => import('../pages/dashboard/CommunityMemberDashboard'));

// Site management components
const SitesList = React.lazy(() => import('../pages/dashboard/SitesList'));
const SitesMap = React.lazy(() => import('../pages/dashboard/SitesMap'));
const SiteCreation = React.lazy(() => import('../pages/dashboard/SiteCreation'));
const SiteEditing = React.lazy(() => import('../pages/dashboard/SiteEditing'));
const SiteDetails = React.lazy(() => import('../pages/SiteDetails'));
const ArchiveManagement = React.lazy(() => import('../components/dashboard/ArchiveManagement'));

// Media management components
const MediaManagement = React.lazy(() => import('../pages/dashboard/MediaManagement'));

// Status management components
const StatusManagement = React.lazy(() => import('../pages/dashboard/StatusManagement'));

// Document management components
const DocumentManagement = React.lazy(() => import('../pages/dashboard/DocumentManagement'));
const Folders = React.lazy(() => import('../pages/dashboard/Folders'));

// Analytics components
const Analytics = React.lazy(() => import('../pages/dashboard/Analytics'));

// User Activity components
const UserActivity = React.lazy(() => import('../pages/dashboard/UserActivity'));

// Artifact management components
const ArtifactsList = React.lazy(() => import('../pages/dashboard/ArtifactsList'));
const ArtifactCreation = React.lazy(() => import('../pages/dashboard/ArtifactCreation'));
const ArtifactDetails = React.lazy(() => import('../pages/dashboard/ArtifactDetails'));
const ArtifactEditing = React.lazy(() => import('../pages/dashboard/ArtifactEditing'));


// Educational content components
const EducationalArticles = React.lazy(() => import('../pages/dashboard/EducationalArticles'));
const EducationalArticleDetail = React.lazy(() => import('../pages/dashboard/EducationalArticleDetail'));
const EducationalQuizzes = React.lazy(() => import('../pages/dashboard/EducationalQuizzes'));
const EducationalContentCreation = React.lazy(() => import('../pages/dashboard/EducationalContentCreation'));

// Community management components
const CommunityModeration = React.lazy(() => import('../pages/dashboard/CommunityModeration'));
const CommunityReports = React.lazy(() => import('../pages/dashboard/CommunityReports'));

// User management components
const UsersList = React.lazy(() => import('../pages/dashboard/UsersList'));
const UserCreation = React.lazy(() => import('../pages/dashboard/UserCreation'));
const RoleManagement = React.lazy(() => import('../pages/dashboard/RoleManagement'));

// Report components
const ReportBuilder = React.lazy(() => import('../pages/dashboard/ReportBuilder'));

// Learning components
const LearningProgress = React.lazy(() => import('../pages/dashboard/LearningProgress'));
const QuizTaking = React.lazy(() => import('../pages/dashboard/QuizTaking'));

// Wrapper components to avoid hook calls in route elements
const SiteManagementLayoutWrapper = ({ children }) => {
    const { user } = useAuth();
    if (user?.role === 'SYSTEM_ADMINISTRATOR') {
        return <AdminLayout>{children}</AdminLayout>;
    } else if (user?.role === 'HERITAGE_MANAGER') {
        return <HeritageManagerLayout>{children}</HeritageManagerLayout>;
    } else {
        // Fallback for other roles
        return <AdminLayout>{children}</AdminLayout>;
    }
};

const MediaManagementWrapper = () => {
    const { user } = useAuth();

    // Heritage Managers should NEVER access general media management
    // They should only access site-specific media through their dashboard
    if (user?.role === 'HERITAGE_MANAGER') {
        return <Navigate to="/dashboard" replace />;
    }

    if (user?.role === 'SYSTEM_ADMINISTRATOR') {
        return <AdminLayout><MediaManagement /></AdminLayout>;
    } else {
        return <ContentManagerLayout><MediaManagement /></ContentManagerLayout>;
    }
};

const DocumentManagementWrapper = () => {
    const { user } = useAuth();
    if (user?.role === 'SYSTEM_ADMINISTRATOR') {
        return <AdminLayout><DocumentManagement /></AdminLayout>;
    } else if (user?.role === 'HERITAGE_MANAGER') {
        return <HeritageManagerLayout><DocumentManagement /></HeritageManagerLayout>;
    } else {
        return <ContentManagerLayout><DocumentManagement /></ContentManagerLayout>;
    }
};

const FoldersWrapper = () => {
    const { user } = useAuth();
    if (user?.role === 'SYSTEM_ADMINISTRATOR') {
        return <AdminLayout><Folders /></AdminLayout>;
    } else if (user?.role === 'HERITAGE_MANAGER') {
        return <HeritageManagerLayout><Folders /></HeritageManagerLayout>;
    } else {
        return <ContentManagerLayout><Folders /></ContentManagerLayout>;
    }
};

const ForumWrapper = () => {
    const { user } = useAuth();
    if (user?.role === 'SYSTEM_ADMINISTRATOR') {
        return <AdminLayout><Forum /></AdminLayout>;
    } else if (user?.role === 'CONTENT_MANAGER') {
        return <ContentManagerLayout><Forum /></ContentManagerLayout>;
    } else {
        return <CommunityMemberLayout><Forum /></CommunityMemberLayout>;
    }
};

const EducationalArticlesWrapper = ({ children }) => {
    const { user } = useAuth();
    if (user?.role === 'SYSTEM_ADMINISTRATOR') {
        return <AdminLayout>{children}</AdminLayout>;
    } else if (user?.role === 'CONTENT_MANAGER') {
        return <ContentManagerLayout>{children}</ContentManagerLayout>;
    } else {
        return <CommunityMemberLayout>{children}</CommunityMemberLayout>;
    }
};

// Loading component
const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
        </div>
    </div>
);

const AppRoutes = () => {
    const { user, loading } = useAuth();

    // Debug logging
    console.log('AppRoutes - User state:', user);
    console.log('AppRoutes - Loading state:', loading);
    console.log('AppRoutes - User role:', user?.role);
    console.log('AppRoutes - Current pathname:', window.location.pathname);



    // Only show loading spinner for protected routes, not public routes
    const isPublicRoute = window.location.pathname === '/' ||
        window.location.pathname === '/about' ||
        window.location.pathname === '/contact' ||
        window.location.pathname === '/login' ||
        window.location.pathname === '/register';

    // Always render the same structure, just conditionally show loading
    if (loading && !isPublicRoute) {
        return (
            <Suspense fallback={<LoadingSpinner />}>
                <LoadingSpinner />
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                {/* Public Routes - Landing page is always accessible */}
                <Route path="/" element={
                    <RouteErrorBoundary routeName="Public Pages">
                        {user ? <Navigate to="/dashboard" /> : <LandingPage />}
                    </RouteErrorBoundary>
                } />
                <Route path="/about" element={
                    <RouteErrorBoundary routeName="About Page">
                        <About />
                    </RouteErrorBoundary>
                } />
                <Route path="/contact" element={
                    <RouteErrorBoundary routeName="Contact Page">
                        <Contact />
                    </RouteErrorBoundary>
                } />



                {/* Ensure landing page is accessible even with trailing slashes */}
                <Route path="/index.html" element={
                    <RouteErrorBoundary routeName="Landing Page">
                        <LandingPage />
                    </RouteErrorBoundary>
                } />

                {/* Public Educational Content Route */}
                <Route path="/education" element={
                    <RouteErrorBoundary routeName="Public Educational Content">
                        <PublicEducationalContent />
                    </RouteErrorBoundary>
                } />

                {/* Heritage Site Details Route - Public access */}
                <Route path="/heritage-site/:id" element={
                    <RouteErrorBoundary routeName="Heritage Site Details">
                        <HeritageSiteDetails />
                    </RouteErrorBoundary>
                } />

                {/* Authentication Routes - Only show when user is not authenticated */}
                <Route path="/login" element={
                    <RouteErrorBoundary routeName="Login Page">
                        {user ? <Navigate to="/dashboard" /> : <Login />}
                    </RouteErrorBoundary>
                } />
                <Route path="/register" element={
                    <RouteErrorBoundary routeName="Registration Page">
                        {user ? <Navigate to="/dashboard" /> : <Register />}
                    </RouteErrorBoundary>
                } />
                <Route path="/forgot-password" element={
                    <RouteErrorBoundary routeName="Forgot Password">
                        <ForgotPassword />
                    </RouteErrorBoundary>
                } />
                <Route path="/auth/google/callback" element={
                    <RouteErrorBoundary routeName="Google Authentication">
                        <GoogleCallback />
                    </RouteErrorBoundary>
                } />
                <Route path="/reset-password" element={
                    <RouteErrorBoundary routeName="Reset Password">
                        <ResetPassword />
                    </RouteErrorBoundary>
                } />
                <Route path="/verify-email" element={
                    <RouteErrorBoundary routeName="Email Verification">
                        <VerifyEmail />
                    </RouteErrorBoundary>
                } />



                {/* Protected Dashboard Routes - Only accessible when authenticated */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <RouteErrorBoundary routeName="Dashboard">
                            <Dashboard />
                        </RouteErrorBoundary>
                    </ProtectedRoute>
                } />

                {/* Role-based Dashboard Routes */}
                <Route path="/dashboard/admin" element={
                    <RoleBasedRoute allowedRoles={['SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Admin Dashboard">
                            <AdminDashboard />
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/heritage-manager" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER']}>
                        <RouteErrorBoundary routeName="Heritage Manager Dashboard">
                            <HeritageManagerDashboard />
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/content-manager" element={
                    <RoleBasedRoute allowedRoles={['CONTENT_MANAGER']}>
                        <RouteErrorBoundary routeName="Content Manager Dashboard">
                            <ContentManagerDashboard />
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/community-member" element={
                    <RoleBasedRoute allowedRoles={['COMMUNITY_MEMBER']}>
                        <RouteErrorBoundary routeName="Community Member Dashboard">
                            <CommunityMemberDashboard />
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* Site Management Routes - Role-Based Layouts */}
                <Route path="/dashboard/sites" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Sites List">
                            <SiteManagementLayoutWrapper>
                                <SitesList />
                            </SiteManagementLayoutWrapper>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/sites/create" element={
                    <RoleBasedRoute allowedRoles={['SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Site Creation">
                            <AdminLayout>
                                <SiteCreation />
                            </AdminLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/sites/:id" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Site Details">
                            <SiteManagementLayoutWrapper>
                                <SiteDetails />
                            </SiteManagementLayoutWrapper>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/sites/:id/edit" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Site Editing">
                            <SiteManagementLayoutWrapper>
                                <SiteEditing />
                            </SiteManagementLayoutWrapper>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/sites/map" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Sites Map">
                            <SiteManagementLayoutWrapper>
                                <SitesMap />
                            </SiteManagementLayoutWrapper>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/sites/archive" element={
                    <RoleBasedRoute allowedRoles={['SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Archive Management">
                            <AdminLayout>
                                <ArchiveManagement />
                            </AdminLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* Media Management Routes */}
                <Route path="/dashboard/media" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Media Management">
                            <MediaManagementWrapper />
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/sites/:siteId/media" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Site Media Management">
                            <HeritageManagerLayout>
                                <MediaManagement />
                            </HeritageManagerLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />



                {/* Status Management Routes */}
                <Route path="/dashboard/status" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Status Management">
                            <SiteManagementLayoutWrapper>
                                <StatusManagement />
                            </SiteManagementLayoutWrapper>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* Document Management Routes */}
                <Route path="/dashboard/documents" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Document Management">
                            <DocumentManagementWrapper />
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* Folders Management Route */}
                <Route path="/dashboard/documents/folders" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Folders Management">
                            <FoldersWrapper />
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* Analytics Routes */}
                <Route path="/dashboard/analytics" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Analytics">
                            <SiteManagementLayoutWrapper>
                                <Analytics />
                            </SiteManagementLayoutWrapper>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* User Activity Routes */}
                <Route path="/dashboard/activity" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="User Activity">
                            <AdminLayout>
                                <UserActivity />
                            </AdminLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* Community Routes */}
                <Route path="/dashboard/community/forums" element={
                    <RoleBasedRoute allowedRoles={['CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR', 'COMMUNITY_MEMBER']}>
                        <RouteErrorBoundary routeName="Community Forums">
                            <ForumWrapper />
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* Artifact Management Routes */}
                <Route path="/dashboard/artifacts" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR', 'COMMUNITY_MEMBER']}>
                        <RouteErrorBoundary routeName="Artifacts List">
                            <HeritageManagerLayout>
                                <ArtifactsList />
                            </HeritageManagerLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/artifacts/create" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Artifact Creation">
                            <HeritageManagerLayout>
                                <ArtifactCreation />
                            </HeritageManagerLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/artifacts/:id" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR', 'COMMUNITY_MEMBER']}>
                        <RouteErrorBoundary routeName="Artifact Details">
                            <HeritageManagerLayout>
                                <ArtifactDetails />
                            </HeritageManagerLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/artifacts/:id/edit" element={
                    <RoleBasedRoute allowedRoles={['HERITAGE_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Artifact Editing">
                            <HeritageManagerLayout>
                                <ArtifactEditing />
                            </HeritageManagerLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />



                {/* Educational Content Routes */}
                <Route path="/dashboard/education/articles" element={
                    <RoleBasedRoute allowedRoles={['CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR', 'COMMUNITY_MEMBER']}>
                        <RouteErrorBoundary routeName="Educational Articles">
                            <EducationalArticlesWrapper>
                                <EducationalArticles />
                            </EducationalArticlesWrapper>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/education/articles/:id" element={
                    <RoleBasedRoute allowedRoles={['CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR', 'COMMUNITY_MEMBER']}>
                        <RouteErrorBoundary routeName="Educational Article Detail">
                            <ContentManagerLayout>
                                <EducationalArticleDetail />
                            </ContentManagerLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/education/articles/:id/edit" element={
                    <RoleBasedRoute allowedRoles={['CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Educational Article Edit">
                            <ContentManagerLayout>
                                <EducationalContentCreation />
                            </ContentManagerLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/education/quizzes" element={
                    <RoleBasedRoute allowedRoles={['CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR', 'COMMUNITY_MEMBER']}>
                        <RouteErrorBoundary routeName="Educational Quizzes">
                            <ContentManagerLayout>
                                <EducationalQuizzes />
                            </ContentManagerLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/education/create" element={
                    <RoleBasedRoute allowedRoles={['CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Educational Content Creation">
                            <ContentManagerLayout>
                                <EducationalContentCreation />
                            </ContentManagerLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* Community Management Routes */}
                <Route path="/dashboard/community/moderation" element={
                    <RoleBasedRoute allowedRoles={['CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Community Moderation">
                            <ContentManagerLayout>
                                <CommunityModeration />
                            </ContentManagerLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/community/reports" element={
                    <RoleBasedRoute allowedRoles={['CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Community Reports">
                            <ContentManagerLayout>
                                <CommunityReports />
                            </ContentManagerLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* User Management Routes */}
                <Route path="/dashboard/users" element={
                    <RoleBasedRoute allowedRoles={['SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Users List">
                            <AdminLayout>
                                <UsersList />
                            </AdminLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/users/create" element={
                    <RoleBasedRoute allowedRoles={['SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="User Creation">
                            <AdminLayout>
                                <UserCreation />
                            </AdminLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/users/roles" element={
                    <RoleBasedRoute allowedRoles={['SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Role Management">
                            <AdminLayout>
                                <RoleManagement />
                            </AdminLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* Report Builder Route */}
                <Route path="/dashboard/reports" element={
                    <RoleBasedRoute allowedRoles={['SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Report Builder">
                            <AdminLayout>
                                <ReportBuilder />
                            </AdminLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* Learning Routes */}
                <Route path="/dashboard/learning" element={
                    <RoleBasedRoute allowedRoles={['COMMUNITY_MEMBER', 'CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Learning Progress">
                            <CommunityMemberLayout>
                                <LearningProgress />
                            </CommunityMemberLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/learning/quizzes" element={
                    <RoleBasedRoute allowedRoles={['COMMUNITY_MEMBER', 'CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Quiz Taking">
                            <CommunityMemberLayout>
                                <QuizTaking />
                            </CommunityMemberLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                <Route path="/dashboard/learning/quiz/:quizId" element={
                    <RoleBasedRoute allowedRoles={['COMMUNITY_MEMBER', 'CONTENT_MANAGER', 'SYSTEM_ADMINISTRATOR']}>
                        <RouteErrorBoundary routeName="Quiz Taking">
                            <CommunityMemberLayout>
                                <QuizTaking />
                            </CommunityMemberLayout>
                        </RouteErrorBoundary>
                    </RoleBasedRoute>
                } />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />

                {/* Debug route - remove this in production */}
                <Route path="/debug/clear-auth" element={
                    <div className="min-h-screen flex items-center justify-center">
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('refreshToken');
                                window.location.href = '/';
                            }}
                            className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                            Clear Auth & Go to Landing Page
                        </button>
                    </div>
                } />
            </Routes>
        </Suspense >
    );
};

export default AppRoutes; 