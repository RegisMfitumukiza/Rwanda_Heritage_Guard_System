// Mobile-first breakpoint system
export const breakpoints = {
    xs: '320px',    // Extra small phones
    sm: '640px',    // Small phones
    md: '768px',    // Tablets
    lg: '1024px',   // Small laptops
    xl: '1280px',   // Large laptops
    '2xl': '1536px' // Desktop monitors
};

// Responsive spacing scale
export const spacing = {
    xs: {
        xs: '0.5rem',    // 8px
        sm: '0.75rem',   // 12px
        md: '1rem',      // 16px
        lg: '1.25rem',   // 20px
        xl: '1.5rem'     // 24px
    },
    sm: {
        xs: '0.75rem',   // 12px
        sm: '1rem',      // 16px
        md: '1.5rem',    // 24px
        lg: '2rem',      // 32px
        xl: '2.5rem'     // 40px
    },
    md: {
        xs: '1rem',      // 16px
        sm: '1.5rem',    // 24px
        md: '2rem',      // 32px
        lg: '2.5rem',    // 40px
        xl: '3rem'       // 48px
    },
    lg: {
        xs: '1.25rem',   // 20px
        sm: '1.75rem',   // 28px
        md: '2.25rem',   // 36px
        lg: '3rem',      // 48px
        xl: '3.75rem'    // 60px
    }
};

// Responsive text sizes
export const textSizes = {
    xs: {
        xs: 'text-xs',      // 12px
        sm: 'text-sm',      // 14px
        md: 'text-base',    // 16px
        lg: 'text-lg',      // 18px
        xl: 'text-xl'       // 20px
    },
    sm: {
        xs: 'text-sm',      // 14px
        sm: 'text-base',    // 16px
        md: 'text-lg',      // 18px
        lg: 'text-xl',      // 20px
        xl: 'text-2xl'      // 24px
    },
    md: {
        xs: 'text-base',    // 16px
        sm: 'text-lg',      // 18px
        md: 'text-xl',      // 20px
        lg: 'text-2xl',     // 24px
        xl: 'text-3xl'      // 30px
    },
    lg: {
        xs: 'text-lg',      // 18px
        sm: 'text-xl',      // 20px
        md: 'text-2xl',     // 24px
        lg: 'text-3xl',     // 30px
        xl: 'text-4xl'      // 36px
    }
};

// Responsive grid columns
export const gridCols = {
    xs: 'grid-cols-1',
    sm: 'grid-cols-2',
    md: 'grid-cols-3',
    lg: 'grid-cols-4',
    xl: 'grid-cols-5',
    '2xl': 'grid-cols-6'
};

// Responsive gap sizes
export const gaps = {
    xs: 'gap-2',      // 8px
    sm: 'gap-3',      // 12px
    md: 'gap-4',      // 16px
    lg: 'gap-6',      // 24px
    xl: 'gap-8',      // 32px
    '2xl': 'gap-10'   // 40px
};

// Touch-friendly sizes
export const touchTargets = {
    button: 'min-h-[44px] min-w-[44px]',  // iOS minimum touch target
    input: 'min-h-[44px]',                // Minimum input height
    link: 'min-h-[44px] min-w-[44px]',    // Minimum link size
    icon: 'w-6 h-6'                       // Minimum icon size
};

// Mobile-specific utilities
export const mobileUtils = {
    // Hide on mobile
    hideXs: 'hidden sm:block',
    hideSm: 'hidden md:block',
    hideMd: 'hidden lg:block',

    // Show only on mobile
    showXs: 'block sm:hidden',
    showSm: 'block md:hidden',
    showMd: 'block lg:hidden',

    // Mobile-first responsive classes
    responsive: {
        xs: 'block',
        sm: 'sm:block',
        md: 'md:block',
        lg: 'lg:block',
        xl: 'xl:block'
    }
};

// Responsive container classes
export const containers = {
    xs: 'px-4',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 md:px-8',
    lg: 'px-4 sm:px-6 md:px-8 lg:px-12',
    xl: 'px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16'
};

// Responsive padding classes
export const padding = {
    xs: 'p-4',
    sm: 'p-4 sm:p-6',
    md: 'p-4 sm:p-6 md:p-8',
    lg: 'p-4 sm:p-6 md:p-8 lg:p-12',
    xl: 'p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16'
};

// Responsive margin classes
export const margin = {
    xs: 'm-4',
    sm: 'm-4 sm:m-6',
    md: 'm-4 sm:m-6 md:m-8',
    lg: 'm-4 sm:m-6 md:m-8 lg:m-12',
    xl: 'm-4 sm:m-6 md:m-8 lg:m-12 xl:m-16'
};

// Responsive flex utilities
export const flexUtils = {
    // Direction
    direction: {
        xs: 'flex-col',
        sm: 'flex-col sm:flex-row',
        md: 'flex-col md:flex-row',
        lg: 'flex-col lg:flex-row'
    },

    // Alignment
    align: {
        xs: 'items-start',
        sm: 'items-start sm:items-center',
        md: 'items-start md:items-center',
        lg: 'items-start lg:items-center'
    },

    // Justify
    justify: {
        xs: 'justify-start',
        sm: 'justify-start sm:justify-center',
        md: 'justify-start md:justify-center',
        lg: 'justify-start lg:justify-center'
    }
};

// Media query helpers
export const mediaQueries = {
    xs: `@media (min-width: ${breakpoints.xs})`,
    sm: `@media (min-width: ${breakpoints.sm})`,
    md: `@media (min-width: ${breakpoints.md})`,
    lg: `@media (min-width: ${breakpoints.lg})`,
    xl: `@media (min-width: ${breakpoints.xl})`,
    '2xl': `@media (min-width: ${breakpoints['2xl']})`
};

// Responsive class generator
export const responsiveClass = (baseClass, variants = {}) => {
    const classes = [baseClass];

    Object.entries(variants).forEach(([breakpoint, variant]) => {
        if (variant) {
            classes.push(`${breakpoint}:${variant}`);
        }
    });

    return classes.join(' ');
};

// Touch-friendly spacing
export const touchSpacing = {
    button: 'px-4 py-3',
    input: 'px-4 py-3',
    link: 'px-3 py-2'
};

// Responsive typography
export const typography = {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl',
    h4: 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl',
    body: 'text-sm sm:text-base md:text-lg',
    small: 'text-xs sm:text-sm'
};

// Responsive spacing utilities
export const responsiveSpacing = {
    section: 'py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24',
    container: 'px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16',
    gap: 'gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12'
};


