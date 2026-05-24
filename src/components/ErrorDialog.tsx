"use client"
import { Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
export default function ErrorDialog({ title, message, openState, handleClose }: { title: string, message: string, openState: boolean, handleClose: () => void }) {
    return (<Dialog open={openState} onClose={handleClose}>
        <DialogTitle>
            {title}
        </DialogTitle>
        <DialogContent>
            <DialogContentText>
                {message}
            </DialogContentText>
        </DialogContent>
    </Dialog>)
}