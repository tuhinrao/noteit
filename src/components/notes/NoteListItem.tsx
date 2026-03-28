"use client";

import PushPinIcon from "@mui/icons-material/PushPin";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import {
  Card,
  CardContent,
  CardActions,
  IconButton,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import Link from "next/link";
import { Note } from "@/types/notes";

interface NoteListItemProps {
  note: Note;
  onDelete: (clientId: string) => void;
  onTogglePin: (note: Note) => void;
  onToggleArchive: (note: Note) => void;
}

export default function NoteListItem({
  note,
  onDelete,
  onTogglePin,
  onToggleArchive,
}: NoteListItemProps) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Typography variant="h6" sx={{ wordBreak: "break-word" }}>
              {note.title}
            </Typography>
            {note.isPinned ? <PushPinIcon fontSize="small" color="primary" /> : null}
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {note.body || "No content"}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Updated: {new Date(note.updatedAt).toLocaleString()}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: "space-between", flexWrap: "wrap" }}>
        <Stack direction="row" spacing={1}>
          <Tooltip title={note.isPinned ? "Unpin" : "Pin"}>
            <IconButton onClick={() => onTogglePin(note)} size="small">
              {note.isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title={note.isArchived ? "Unarchive" : "Archive"}>
            <IconButton onClick={() => onToggleArchive(note)} size="small">
              {note.isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton onClick={() => onDelete(note.clientId)} size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Tooltip title="Edit">
          <IconButton component={Link} href={`/notes/${note.clientId}`} size="small">
            <EditIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}