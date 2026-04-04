import React from "react";
import AppointmentsRequiringVitals from "@/components/nurse/AppointmentsRequiringVitals";
import { Container, Typography } from "@mui/material";

const VitalsInputPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Vitals Input
      </Typography>
      <AppointmentsRequiringVitals />
    </Container>
  );
};

export default VitalsInputPage;
