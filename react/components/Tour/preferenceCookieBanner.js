import { Alert, Box, Button, Collapse } from "@mui/material";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!Cookies.get("prefsAcknowledged")) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    Cookies.set("prefsAcknowledged", "true", {
      expires: 365,
    });
    setOpen(false);
  };

  return (
    <Collapse in={open}>
      <Box
        sx={{
          position: "fixed",
          bottom: 55,
          left: 16,
          right: 16,
          zIndex: 2000,
        }}
      >
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              onClick={handleClose}
            >
              Got it
            </Button>
          }
        >
          We use cookies to remember your preferences and improve your
          experience.
        </Alert>
      </Box>
    </Collapse>
  );
}