// Responsive Design Utilities
// Provides consistent responsive classes and helper functions

// Responsive text sizing utilities
export const responsiveText = {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl',
    h4: 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl',
    body: 'text-sm sm:text-base md:text-lg',
    small: 'text-xs sm:text-sm',
    large: 'text-lg sm:text-xl md:text-2xl'
};

// Responsive spacing utilities
export const responsiveSpacing = {
    section: 'py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24',
    container: 'px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12',
    gap: 'gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10',
    margin: 'm-4 sm:m-6 md:m-8 lg:m-12 xl:m-16',
    padding: 'p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16'
};

// Responsive grid utilities
export const responsiveGrid = {
    cols1: 'grid-cols-1',
    cols2: 'grid-cols-1 sm:grid-cols-2',
    cols3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    cols4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    cols5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    cols6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
};

// Responsive flex utilities
export const responsiveFlex = {
    col: 'flex-col',
    row: 'flex-row',
    colToRow: 'flex-col sm:flex-row',
    colToRowMd: 'flex-col md:flex-row',
    colToRowLg: 'flex-col lg:flex-row',
    center: 'items-center justify-center',
    centerSm: 'items-start justify-start sm:items-center sm:justify-center',
    centerMd: 'items-start justify-start md:items-center md:justify-center'
};

// Responsive visibility utilities
export const responsiveVisibility = {
    hideXs: 'hidden sm:block',
    hideSm: 'hidden md:block',
    hideMd: 'hidden lg:block',
    hideLg: 'hidden xl:block',
    showXs: 'block sm:hidden',
    showSm: 'block md:hidden',
    showMd: 'block lg:hidden',
    showLg: 'block xl:hidden'
};

// Touch-friendly sizing utilities
export const touchFriendly = {
    button: 'min-h-[44px] min-w-[44px]',
    input: 'min-h-[44px]',
    link: 'min-h-[44px] min-w-[44px]',
    icon: 'w-6 h-6',
    iconSmall: 'w-5 h-5',
    iconLarge: 'w-8 h-8'
};

// Responsive button sizing
export const responsiveButton = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
    xl: 'px-8 py-5 text-xl min-h-[60px]'
};

// Responsive input sizing
export const responsiveInput = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
};

// Responsive card utilities
export const responsiveCard = {
    padding: 'p-4 sm:p-6 md:p-8',
    margin: 'm-4 sm:m-6 md:m-8',
    gap: 'gap-4 sm:gap-6 md:gap-8'
};

// Responsive navigation utilities
export const responsiveNav = {
    container: 'px-3 sm:px-4 md:px-6 lg:px-8',
    padding: 'py-3 sm:py-4',
    logo: 'h-8 w-8 sm:h-10 sm:w-10',
    text: 'text-lg sm:text-xl'
};

// Responsive hero section utilities
export const responsiveHero = {
    title: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl',
    subtitle: 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl',
    button: 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg min-h-[44px]',
    search: 'max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl',
    stats: 'grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4'
};

// Responsive form utilities
export const responsiveForm = {
    container: 'space-y-4 sm:space-y-6',
    input: 'px-4 py-3 text-base min-h-[44px]',
    button: 'px-6 py-3 text-base min-h-[44px] w-full sm:w-auto',
    label: 'text-sm sm:text-base font-medium'
};

// Responsive table utilities
export const responsiveTable = {
    container: 'overflow-x-auto',
    table: 'min-w-full',
    cell: 'px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base'
};

// Responsive modal utilities
export const responsiveModal = {
    container: 'm-4 sm:m-8 md:m-12 lg:m-16',
    padding: 'p-4 sm:p-6 md:p-8',
    maxWidth: 'max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl'
};

// Helper function to combine responsive classes
export const combineResponsive = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

// Helper function to create responsive variants
export const createResponsiveVariant = (base, variants) => {
    const result = [base];
    
    Object.entries(variants).forEach(([breakpoint, variant]) => {
        if (variant) {
            result.push(`${breakpoint}:${variant}`);
        }
    });
    
    return result.join(' ');
};

// Export all utilities as a single object for easy importing
export default {
    text: responsiveText,
    spacing: responsiveSpacing,
    grid: responsiveGrid,
    flex: responsiveFlex,
    visibility: responsiveVisibility,
    touch: touchFriendly,
    button: responsiveButton,
    input: responsiveInput,
    card: responsiveCard,
    nav: responsiveNav,
    hero: responsiveHero,
    form: responsiveForm,
    table: responsiveTable,
    modal: responsiveModal,
    combine: combineResponsive,
    variant: createResponsiveVariant
};


