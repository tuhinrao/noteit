import { Box, Container } from "@mui/material";
import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        py: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="md">{children}</Container>
    </Box>
  );
}