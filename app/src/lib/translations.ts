export type Language = 'th' | 'en';

interface TopBarTranslations {
    dashboard: string;
    allZones: string;
    allClubs: string;
    search: string;
    clearFilters: string;
    refreshTitle: string;
    languageButton: string;
    switchLanguage: string;
}

interface SidebarTranslations {
    uploadNew: string;
    collapseSidebar: string;
}

interface UploadGateTranslations {
    subtitle: string;
    importTitle: string;
    errorTitle: string;
    dropPrompt: string;
    instructions: string;
    browseFile: string;
    tryAgain: string;
    supportedFiles: string;
    processing: string;
    processingSteps: string;
    footerNote: string;
}

interface CommandPaletteTranslations {
    nav: {
        overview: string;
        zoneCompare: string;
        clubCompare: string;
        dayAnalysis: string;
        courtDetails: string;
    };
    sectionNavigation: string;
    sectionZones: string;
    sectionClubs: string;
    searchPlaceholder: string;
    noResults: string;
    occupancyLabel: string;
    clubSectionSubtitle: (zone: string, occupancy: number) => string;
}

interface FooterTranslations {
    text: string;
}

interface AppTranslations {
    topBar: TopBarTranslations;
    sidebar: SidebarTranslations;
    uploadGate: UploadGateTranslations;
    commandPalette: CommandPaletteTranslations;
    footer: FooterTranslations;
}

export const translations: Record<Language, AppTranslations> = {
    th: {
        topBar: {
            dashboard: 'แดชบอร์ด',
            allZones: 'ทุกโซน',
            allClubs: 'ทุกสนาม',
            search: 'ค้นหา',
            clearFilters: 'ล้างตัวกรอง',
            refreshTitle: 'รีเฟรชข้อมูล',
            languageButton: 'EN',
            switchLanguage: 'สลับเป็น English',
        },
        sidebar: {
            uploadNew: 'นำเข้าใหม่',
            collapseSidebar: 'ยุบ sidebar',
        },
        uploadGate: {
            subtitle: 'ระบบวิเคราะห์ข้อมูลสนาม Padel',
            importTitle: 'นำเข้าไฟล์ข้อมูล',
            errorTitle: 'เกิดข้อผิดพลาด',
            dropPrompt: 'ลากไฟล์ Excel (.xlsx) มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์',
            instructions: 'รองรับเฉพาะไฟล์ .xlsx ที่ได้จากระบบ',
            browseFile: 'เลือกไฟล์',
            tryAgain: 'ลองใหม่',
            supportedFiles: 'ข้อมูลจะถูกประมวลผลในเบราว์เซอร์ ไม่มีการส่งข้อมูลออกไป',
            processing: 'กำลังประมวลผลข้อมูล...',
            processingSteps: 'อ่านไฟล์ → แปลงข้อมูล → คำนวณ metrics',
            footerNote: 'ข้อมูลจะถูกประมวลผลในเบราว์เซอร์ ไม่มีการส่งข้อมูลออกไป',
        },
        commandPalette: {
            nav: {
                overview: 'ภาพรวม',
                zoneCompare: 'เปรียบเทียบโซน',
                clubCompare: 'เปรียบเทียบสนาม',
                dayAnalysis: 'วิเคราะห์ตามวัน',
                courtDetails: 'รายละเอียดคอร์ท',
            },
            sectionNavigation: 'การนำทาง',
            sectionZones: 'โซน',
            sectionClubs: 'สนามยอดนิยม',
            searchPlaceholder: 'ค้นหาหรือพิมพ์คำสั่ง...',
            noResults: 'ไม่พบผลลัพธ์',
            occupancyLabel: 'อัตราการใช้งาน',
            clubSectionSubtitle: (zone, occupancy) => `${zone} · อัตราการใช้งาน ${occupancy}%`,
        },
        footer: {
            text: 'Padel Analytics · ระบบวิเคราะห์ข้อมูลสนาม Padel · ข้อมูลประมวลผลในเบราว์เซอร์',
        },
    },
    en: {
        topBar: {
            dashboard: 'Dashboard',
            allZones: 'All Zones',
            allClubs: 'All Clubs',
            search: 'Search',
            clearFilters: 'Clear Filters',
            refreshTitle: 'Refresh data',
            languageButton: 'TH',
            switchLanguage: 'Switch to ไทย',
        },
        sidebar: {
            uploadNew: 'Upload New',
            collapseSidebar: 'Collapse sidebar',
        },
        uploadGate: {
            subtitle: 'Padel court analytics',
            importTitle: 'Import data file',
            errorTitle: 'Something went wrong',
            dropPrompt: 'Drag and drop an Excel file (.xlsx) here, or click to select a file',
            instructions: 'Only .xlsx files from the system are supported',
            browseFile: 'Choose file',
            tryAgain: 'Try again',
            supportedFiles: 'Data is processed in the browser and not sent anywhere',
            processing: 'Processing data...',
            processingSteps: 'Read file → transform data → calculate metrics',
            footerNote: 'Data is processed in the browser and not sent anywhere',
        },
        commandPalette: {
            nav: {
                overview: 'Overview',
                zoneCompare: 'Zone Compare',
                clubCompare: 'Club Compare',
                dayAnalysis: 'Day Analysis',
                courtDetails: 'Court Details',
            },
            sectionNavigation: 'Navigation',
            sectionZones: 'Zones',
            sectionClubs: 'Popular clubs',
            searchPlaceholder: 'Search or type a command...',
            noResults: 'No results found',
            occupancyLabel: 'Occupancy',
            clubSectionSubtitle: (zone, occupancy) => `${zone} · Occupancy ${occupancy}%`,
        },
        footer: {
            text: 'Padel Analytics · Padel court analytics · Data processed in the browser',
        },
    },
};
