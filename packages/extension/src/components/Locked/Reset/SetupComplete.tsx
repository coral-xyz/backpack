import { Box, Card, CardContent, Grid } from "@mui/material";
import { Header, SubtextParagraph, PrimaryButton } from "../../common";

export function SetupComplete({ closeDrawer }: { closeDrawer: () => void }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        color: "theme.custom.colors.nav",
      }}
    >
      <Box>
        <Header text="You’ve set up Backpack!" />
        <SubtextParagraph>
          Now get started exploring what your Backpack can do.
        </SubtextParagraph>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <ActionCard
              icon={<BackpackIcon />}
              text="Fund your Backpack"
              onClick={() => {}}
            />
          </Grid>
          <Grid item xs={6}>
            <ActionCard
              icon={<XNFTIcon />}
              text="Browse the xNFT library"
              onClick={() => {}}
            />
          </Grid>
          <Grid item xs={6}>
            <ActionCard
              icon={<TwitterIcon />}
              text="Follow us on Twitter"
              onClick={() => {}}
            />
          </Grid>
          <Grid item xs={6}>
            <ActionCard
              icon={<TwitterIcon />}
              text="Join the Discord community"
              onClick={() => {}}
            />
          </Grid>
        </Grid>
      </Box>
      <Box>
        <PrimaryButton label="Done" onClick={closeDrawer} />
      </Box>
    </Box>
  );
}

function ActionCard({
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
        height: "100%",
      }}
    >
      <CardContent onClick={onClick}>
        <Box sx={{ mb: 1 }}>{icon}</Box>
        <Box>{text}</Box>
      </CardContent>
    </Card>
  );
}

function XNFTIcon() {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.5001 3.17497L17.3301 6.00497L14.5001 8.83497L11.6701 6.00497L14.5001 3.17497ZM6.84009 3.65497V7.65497H2.84009V3.65497H6.84009ZM16.8401 13.655V17.655H12.8401V13.655H16.8401ZM6.84009 13.655V17.655H2.84009V13.655H6.84009ZM14.5001 0.344971L8.84009 5.99497L14.5001 11.655L20.1601 5.99497L14.5001 0.344971ZM8.84009 1.65497H0.840088V9.65497H8.84009V1.65497ZM18.8401 11.655H10.8401V19.655H18.8401V11.655ZM8.84009 11.655H0.840088V19.655H8.84009V11.655Z"
        fill="#FAFAFA"
      />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.548 19.9012C16.6044 19.9012 21.558 12.3976 21.558 5.89117C21.558 5.67757 21.558 5.46517 21.5436 5.25517C22.5074 4.55741 23.3392 3.69351 24 2.70397C23.1013 3.10238 22.1479 3.36369 21.1716 3.47917C22.1996 2.86364 22.9689 1.89559 23.3364 0.755172C22.37 1.32864 21.3128 1.73285 20.2104 1.95037C19.4681 1.16049 18.486 0.637374 17.4164 0.462018C16.3467 0.286663 15.249 0.468852 14.2933 0.980375C13.3377 1.4919 12.5773 2.30422 12.13 3.29157C11.6826 4.27891 11.5732 5.38619 11.8188 6.44197C9.86111 6.34386 7.94592 5.83516 6.19757 4.94889C4.44923 4.06263 2.90679 2.8186 1.6704 1.29757C1.04078 2.38142 0.847907 3.66448 1.13104 4.88553C1.41418 6.10658 2.15204 7.17383 3.1944 7.86997C2.41112 7.84725 1.64478 7.63653 0.96 7.25557V7.31797C0.960467 8.45473 1.35407 9.55634 2.07408 10.436C2.79408 11.3157 3.79616 11.9192 4.9104 12.1444C4.18537 12.342 3.42467 12.3708 2.6868 12.2284C3.00139 13.2069 3.61401 14.0627 4.43895 14.6759C5.26389 15.2891 6.25989 15.6291 7.2876 15.6484C6.26654 16.4507 5.09734 17.0438 3.84687 17.3938C2.5964 17.7439 1.28919 17.844 0 17.6884C2.25193 19.1336 4.87223 19.9001 7.548 19.8964"
        fill="#FAFAFA"
      />
    </svg>
  );
}

function BackpackIcon() {
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.7999 0.800049C1.47442 0.800049 0.399902 1.87457 0.399902 3.20005V8.00005C0.399902 9.32553 1.47442 10.4 2.7999 10.4L2.7999 3.20005H14.7999C14.7999 1.87457 13.7254 0.800049 12.3999 0.800049H2.7999Z"
        fill="#FAFAFA"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.1999 8.00005C5.1999 6.67457 6.27442 5.60005 7.5999 5.60005H17.1999C18.5254 5.60005 19.5999 6.67457 19.5999 8.00005V12.8C19.5999 14.1255 18.5254 15.2 17.1999 15.2H7.5999C6.27442 15.2 5.1999 14.1255 5.1999 12.8V8.00005ZM12.3999 12.8C13.7254 12.8 14.7999 11.7255 14.7999 10.4C14.7999 9.07457 13.7254 8.00005 12.3999 8.00005C11.0744 8.00005 9.9999 9.07457 9.9999 10.4C9.9999 11.7255 11.0744 12.8 12.3999 12.8Z"
        fill="#FAFAFA"
      />
    </svg>
  );
}
