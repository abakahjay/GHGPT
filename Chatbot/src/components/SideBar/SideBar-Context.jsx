import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [sideBarVisible, setSideBarVisible] = useState(false);

    const toggleSidebar = () => {
        setSideBarVisible(prev => !prev);
    };

    return (
        <SidebarContext.Provider value={{ sideBarVisible, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSidebarContext = () => {
    return useContext(SidebarContext);
};
