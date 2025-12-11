import React from 'react';
import { format, addWeeks, startOfWeek, endOfWeek, formatISO } from 'date-fns';
import { IconButton, Typography, Box } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface WeekPickerProps {
  currentWeek: Date;
  onWeekChange: (newWeek: Date) => void;
}

const WeekPicker: React.FC<WeekPickerProps> = ({ currentWeek, onWeekChange }) => {
  const startDate = startOfWeek(currentWeek);
  const endDate = endOfWeek(currentWeek);

  const handlePreviousWeek = () => {
    onWeekChange(addWeeks(currentWeek, -1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(currentWeek, 1));
  };

  return (
    <Box display="flex" alignItems="center" mb={2}>
      <IconButton onClick={handlePreviousWeek} size="small">
        <ChevronLeft />
      </IconButton>
      <Typography variant="h6" mx={2}>
        {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
      </Typography>
      <IconButton onClick={handleNextWeek} size="small">
        <ChevronRight />
      </IconButton>
    </Box>
  );
};

export default WeekPicker;