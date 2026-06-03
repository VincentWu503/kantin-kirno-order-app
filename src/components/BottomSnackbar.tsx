"use client"
import { Snackbar, AlertColor, Alert } from "@mui/material"

export default function BottomSnackbar({open, severity, closeAction, snackbarMessage}:
    {open: boolean, severity: AlertColor, closeAction: () => void, snackbarMessage: string}
) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            // onClose={() => setSnackbar(false)}
            onClose={ closeAction }
            onClick={ closeAction }
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
            <Alert severity={severity as AlertColor} onClick={ closeAction }>
                {snackbarMessage}
            </Alert>
        </Snackbar>
    )
}