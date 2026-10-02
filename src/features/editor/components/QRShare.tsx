import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
  Typography,
  Button,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, X, Download } from 'lucide-react';

interface QRShareProps {
  slug: string;
  open?: boolean;
  onClose?: () => void;
  hideTrigger?: boolean;
}

export const QRShare: React.FC<QRShareProps> = ({
  slug,
  open: controlledOpen,
  onClose: controlledOnClose,
  hideTrigger = false,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const handleClose = () => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  const handleOpen = () => {
    if (!isControlled) {
      setInternalOpen(true);
    }
  };

  const padUrl = window.location.href;

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      URL.revokeObjectURL(url);

      const link = document.createElement('a');
      link.download = `onlinepad-${slug}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = url;
  };

  return (
    <>
      {!hideTrigger && (
        <Tooltip title="QR code">
          <IconButton onClick={handleOpen} color="default">
            <QrCode size={20} />
          </IconButton>
        </Tooltip>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            maxWidth: 360,
          },
        }}
      >
        <DialogTitle component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>Share via QR</Typography>
          <IconButton onClick={handleClose} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 2 }}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'white',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              mb: 2,
            }}
          >
            <QRCodeSVG
              id="qr-code-svg"
              value={padUrl}
              size={200}
              level="M"
              includeMargin={false}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              mb: 2,
              wordBreak: 'break-all',
              maxWidth: 280,
            }}
          >
            {padUrl}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Download size={16} />}
            onClick={downloadQR}
            sx={{ borderRadius: 2 }}
          >
            Download PNG
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
