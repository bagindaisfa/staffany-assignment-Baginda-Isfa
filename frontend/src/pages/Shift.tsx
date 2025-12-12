import React, { FunctionComponent, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {
  format,
  startOfWeek,
  endOfWeek,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { useTheme } from "@mui/material/styles";
import { getErrorMessage } from "../helper/error/index";
import {
  deleteShiftById,
  getShifts,
  checkShiftClash,
  publishShifts,
  getWeekByDate,
} from "../helper/api/shift";
import DataTable from "react-data-table-component";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import WeekPicker from "../components/WeekPicker";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "@mui/material/Alert";
import { Link as RouterLink } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShiftData } from "../types/shift";

interface ActionButtonProps {
  id: string;
  onDelete: () => void;
}

const ActionButton: FunctionComponent<ActionButtonProps> = ({
  id,
  onDelete,
}) => {
  return (
    <div>
      <IconButton
        size="small"
        aria-label="edit"
        component={RouterLink}
        to={`/shift/${id}/edit`}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" aria-label="delete" onClick={() => onDelete()}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

const Shift: FunctionComponent = () => {
  const theme = useTheme();
  const history = useHistory();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [rows, setRows] = useState<ShiftData[]>([]);
  const [errMsg, setErrMsg] = useState("");
  const [clashError, setClashError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showClashDialog, setShowClashDialog] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftData | null>(null);
  const [publishedDate, setPublishedDate] = useState("");
  const {
    data: shiftsData,
    isLoading,
    error: fetchError,
  } = useQuery<ShiftData[], Error>({
    queryKey: ["shifts", format(currentWeek, "yyyy-MM-dd")],
    queryFn: () =>
      getShifts({
        startDate: format(startOfWeek(currentWeek), "yyyy-MM-dd"),
        endDate: format(endOfWeek(currentWeek), "yyyy-MM-dd"),
      }),
    initialData: [], // Ensure initial data is an empty array
  });

  const shifts = Array.isArray(shiftsData) ? shiftsData : [];

  const isWeekPublished = shifts.some((shift: ShiftData) => shift?.isPublished);

  const weekShift = shifts.find((s) => s.weekId);
  const weekId = weekShift?.weekId ?? null;
  const dateWeek = shifts.length
    ? shifts.reduce((min, s) => (s.date < min ? s.date : min), shifts[0].date)
    : null;

  useEffect(() => {
    if (isWeekPublished && dateWeek) {
      handleGetWeekByDate();
    }
  }, [isWeekPublished, dateWeek]);

  const onDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const onCloseDeleteDialog = () => {
    setSelectedId(null);
    setShowDeleteConfirm(false);
  };

  // Table columns
  const columns = [
    {
      name: "Name",
      selector: (row: ShiftData) => row.name,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row: ShiftData) => format(parseISO(row.date), "MMM d, yyyy"),
      sortable: true,
    },
    {
      name: "Start Time",
      selector: (row: ShiftData) => format(parseISO(row.startTime), "h:mm a"),
      sortable: true,
    },
    {
      name: "End Time",
      selector: (row: ShiftData) => format(parseISO(row.endTime), "h:mm a"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: ShiftData) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => history.push(`/shift/${row.id}/edit`)}
            disabled={isWeekPublished}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedShift(row);
              setShowDeleteDialog(true);
            }}
            disabled={isWeekPublished}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Handle add shift with clash detection
  const handleAddShift = async () => {
    const newShiftDate = startOfWeek(currentWeek);
    const newShiftStartTime = new Date();
    newShiftStartTime.setMinutes(0, 0, 0);
    const newShiftEndTime = new Date(newShiftStartTime);
    newShiftEndTime.setHours(newShiftStartTime.getHours() + 1);

    try {
      // Check for clashes
      const clash = await checkShiftClash({
        date: format(newShiftDate, "yyyy-MM-dd"),
        startTime: format(newShiftStartTime, "HH:mm"),
        endTime: format(newShiftEndTime, "HH:mm"),
      });

      if (clash.hasClash && clash.conflictingShift) {
        setClashError(
          `This shift clashes with: ${clash.conflictingShift.name} (${format(
            parseISO(clash.conflictingShift.startTime),
            "h:mm a"
          )} - ${format(parseISO(clash.conflictingShift.endTime), "h:mm a")})`
        );
        setShowClashDialog(true);
        return;
      }

      // If no clash, proceed to add shift
      history.push({
        pathname: "/shift/add",
        search: `?date=${format(newShiftDate, "yyyy-MM-dd")}&startTime=${format(
          newShiftStartTime,
          "HH:mm"
        )}&endTime=${format(newShiftEndTime, "HH:mm")}`,
      });
    } catch (err) {
      setError("Error checking for shift clashes");
    }
  };

  const handleIgnoreClash = () => {
    const newShiftDate = startOfWeek(currentWeek);
    const newShiftStartTime = new Date();
    newShiftStartTime.setMinutes(0, 0, 0);
    const newShiftEndTime = new Date(newShiftStartTime);
    newShiftEndTime.setHours(newShiftStartTime.getHours() + 1);

    history.push({
      pathname: "/shift/add",
      search: `?date=${format(newShiftDate, "yyyy-MM-dd")}&startTime=${format(
        newShiftStartTime,
        "HH:mm"
      )}&endTime=${format(newShiftEndTime, "HH:mm")}&ignoreClash=true`,
    });
    setShowClashDialog(false);
  };

  const handlePublishWeek = async () => {
    try {
      if (weekId) {
        await publishShifts(weekId);
        queryClient.invalidateQueries({ queryKey: ["shifts"] });
        await handleGetWeekByDate();
        setShowPublishDialog(false);
      }
    } catch (err) {
      setError("Failed to publish shifts");
    }
  };

  const handleGetWeekByDate = async () => {
    try {
      if (dateWeek) {
        const week = await getWeekByDate(dateWeek);
        setPublishedDate(week.publishedAt);
      }
    } catch (err) {
      setError("Failed to get week by date");
    }
  }

  const handleDelete = async () => {
    if (!selectedShift) return;

    try {
      await deleteShiftById(selectedShift.id);
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      setShowDeleteDialog(false);
    } catch (err) {
      setError("Failed to delete shift");
    }
  };

  const handleWeekChange = async (newWeek: Date) => {
    await handleGetWeekByDate();
    setCurrentWeek(newWeek);
    // Update URL with the new week
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("week", format(newWeek, "yyyy-MM-dd"));
    history.push({ search: searchParams.toString() });
    
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <WeekPicker
                currentWeek={currentWeek}
                onWeekChange={handleWeekChange}
                isWeekPublished={isWeekPublished}
              />
              {/* {isWeekPublished && (
                <Box display="flex" alignItems="center" mr={2}>
                  <TaskAltIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" color="success">
                    Week published on {publishedDate
                      ? format(parseISO(publishedDate), "MMM d, yyyy")
                      : "-"}
                  </Typography>
                </Box>
              )} */}
              <Box display="flex" alignItems="center" mr={2}>
                {isWeekPublished && (
                  <>
                    <TaskAltIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" color="success">
                      Week published on {publishedDate
                        ? format(parseISO(publishedDate), "dd MMM yyyy, h:mm a")
                        : "-"}
                    </Typography>
                  </>
                )}
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={handleAddShift}
                  disabled={isWeekPublished}
                  sx={{ ml: 2, mr: 2 }}
                >
                  Add Shift
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => setShowPublishDialog(true)}
                  disabled={shifts.length === 0 || isWeekPublished}
                >
                  Publish
                </Button>
              </Box>
            </Box>

            {isWeekPublished && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This week has been published. Editing is disabled.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <DataTable
              columns={columns}
              data={shifts}
              progressPending={isLoading}
              noDataComponent="There are no records to display"
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Shift</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this shift?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Publish Confirmation Dialog */}
      <Dialog
        open={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Publish Shifts</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to publish all shifts for this week? Once
            published, shifts cannot be modified.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPublishDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePublishWeek}
            color="primary"
            variant="contained"
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shift Clash Dialog */}
      <Dialog
        open={showClashDialog}
        onClose={() => setShowClashDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Shift Clash Detected</DialogTitle>
        <DialogContent>
          <Typography>{clashError}</Typography>
          <Typography mt={2}>Do you want to proceed anyway?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClashDialog(false)}>Cancel</Button>
          <Button
            onClick={handleIgnoreClash}
            color="primary"
            variant="contained"
          >
            Ignore
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default Shift;
