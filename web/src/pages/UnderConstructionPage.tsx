import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Construction as ConstructionIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

interface UnderConstructionPageProps {
  title?: string;
  code?: string;
}

const UnderConstructionPage = ({ 
  title = 'Coming Soon', 
  code = '503' 
}: UnderConstructionPageProps) => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        {/* Error Code */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '6rem', md: '8rem' },
            fontWeight: 800,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
          }}
        >
          {code}
        </Typography>

        {/* Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ConstructionIcon sx={{ fontSize: 40, color: 'warning.main' }} />
        </Box>

        {/* Title */}
        <Typography variant="h4" fontWeight={700}>
          {title}
        </Typography>

        {/* Description */}
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          We're working hard to bring you this feature. 
          Check back soon for updates!
        </Typography>

        {/* Progress indicator */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            bgcolor: 'action.hover',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'warning.main',
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.4 },
              },
            }}
          />
          <Typography variant="body2" color="text.secondary">
            Under active development
          </Typography>
        </Box>

        {/* Back button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    </Container>
  );
};

export default UnderConstructionPage;
