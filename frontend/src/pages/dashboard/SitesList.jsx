import React from 'react';
import RoleBasedSitesView from '../../components/dashboard/RoleBasedSitesView';

/**
 * Sites List Page
 * Now uses RoleBasedSitesView to automatically render the appropriate interface
 * based on user role and permissions
 * 
 * This component automatically handles:
 * - SYSTEM_ADMINISTRATOR: Full admin interface with search, filters, bulk operations
 * - HERITAGE_MANAGER: Simplified interface focused on assigned sites
 * - CONTENT_MANAGER: Appropriate access message
 * - COMMUNITY_MEMBER: Community access information
 * - Other roles: Access denied with helpful messages
 */
const SitesList = () => {
    return <RoleBasedSitesView />;
};

export default SitesList;
