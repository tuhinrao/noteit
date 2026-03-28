import { Paper, Typography } from "@mui/material";

interface EmptyNotesStateProps {
  title: string;
  description: string;
}

export default function EmptyNotesState({ title, description }: EmptyNotesStateProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: "center",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );
}