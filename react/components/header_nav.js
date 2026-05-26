import React, { useState } from "react";
import { Box, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useSearchParams } from "next/navigation";
import { basePath } from '@/next.config';


export default function HeaderNav({ children, navItems, isActivePage }) {
    const [headerDrawerOpen, setHeaderDrawerOpen] = useState(false);
    const searchParams = useSearchParams();
    const page = searchParams.get("storms");
    const currentUrl = `${basePath}?storms=${page}`;
    

    const toggleDrawer = (open) => (event) => {
        if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
            return;
        }
        setHeaderDrawerOpen(open);
    };


    function handleIconClick(){
        setHeaderDrawerOpen((prevState) => !prevState); // Toggles the drawer open/close
    }

    return (
        <Box
            component="nav"
            className="header_nav"
            
        >
            {/* Hamburger Menu Button for Small Screens */}
            <IconButton
                edge="start"
                aria-label="menu"
                onClick={handleIconClick} // Use the handleIconClick function
                sx={{ display: { xs: "block", md: "none" } }}
                className="menu_icon_small_screen"
            >
                <MenuIcon />
            </IconButton>

            {/* Navigation Links for Larger Screens */}
            <Box
                component="ul"
                sx={{
                    display: { xs: "none", md: "flex" },}}
            >
                {
                    navItems.map((link) => {
                        const isActivePage = currentUrl === link.href;

                        return (
                        <Box
                            component="li"
                            key={link.href}
                            sx={{
                            fontWeight: isActivePage ? "bolder" : "normal",
                            borderBottom: isActivePage ? "3px solid white" : "none",
                            color: isActivePage ? "black !important" : "inherit",
                            }}
                        >
                            <a
                            href={link.href}
                            className="header-drawer-big-screens"
                            >
                            {link.name}
                            </a>
                        </Box>
                        );
                    })
                    }
            </Box>

            {/* Drawer for Small Screens */}
            <Drawer
                anchor="right"
                open={headerDrawerOpen}
                onClose={toggleDrawer(false)}
                sx={{
                    "& .MuiDrawer-paper": { width: 200, 
                                            marginTop: '50px',
                                            backgroundColor:"#f5f5f5",
                                            padding: "2px"},
                    zIndex: '8000',
                    
                }}
            >
                
                <List onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
                    {navItems.map((link) => (
                        <ListItem button key={link.href}
                        sx={{padding:'4px'}}>
                            <ListItemText
                                primary={
                                    <a
                                        href={link.href}
                                        className="header-drawer-small-screens"
                                        
                                    >
                                        {link.name}
                                    </a>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
                
                

            </Drawer>

            {/* Children (Optional Extra Content) */}
            {children}
        </Box>
    );
}

