import { Box, Card, CardContent } from "@mui/material";

export function ActionCard({
  icon,
  text,
  onClick,
}: {
  icon: any;
  text: string;
  onClick: () => void;
}) {
  return (
    <Card
      sx={{
        bgcolor: "#3F3F46",
        p: 1,
        borderRadius: "12px",
        color: "#fff",
        cursor: "pointer",
        height: "112px",
        padding: "16px",
      }}
    >
      <CardContent onClick={onClick} style={{ padding: 0 }}>
        <Box sx={{ mb: 1 }}>{icon}</Box>
        <Box>{text}</Box>
      </CardContent>
    </Card>
  );
}
