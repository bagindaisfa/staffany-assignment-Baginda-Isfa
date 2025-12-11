import React, { FunctionComponent, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { getErrorMessage } from "../helper/error";
import {
  createShifts,
  getShiftById,
  updateShiftById,
} from "../helper/api/shift";
import { useHistory, useParams, useLocation } from "react-router-dom";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useEffect } from "react";
import Joi from "joi";

interface IFormInput {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  ignoreClash: boolean;
}

const shiftSchema = Joi.object({
  name: Joi.string().required(),
  date: Joi.string().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
});

interface RouteParams {
  id: string;
}

const ShiftForm: FunctionComponent = () => {
  const history = useHistory();
  const location = useLocation();
  // Prefill for Add Shift
  const params = new URLSearchParams(location.search);
  const { id } = useParams<RouteParams>();
  const isEdit = id !== undefined;

  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IFormInput>({
    resolver: joiResolver(shiftSchema),
  });

  useEffect(() => {
    const getData = async () => {
      try {
        if (!isEdit) {
          const date = params.get("date");
          const startTime = params.get("startTime");
          const endTime = params.get("endTime");

          if (date) setValue("date", date);
          if (startTime) setValue("startTime", startTime);
          if (endTime) setValue("endTime", endTime);

          return; // ⬅ FIX: stop here if adding new shift
        }

        // Edit shift
        const { results } = await getShiftById(id);

        setValue("name", results.name);
        setValue("date", results.date); // ensure date format
        setValue("startTime", results.startTime);
        setValue("endTime", results.endTime);
      } catch (error) {
        const message = getErrorMessage(error);
        setError(message);
      }
    };

    getData();
  }, [isEdit, id, setValue]);

  const onSubmit = async (data: IFormInput) => {
    try {
      setError("");
      const ignoreClash = params.get("ignoreClash");
      const payload = {
        ...data,
        ignoreClash: ignoreClash === "true"
      };
      
      if (isEdit) {
        await updateShiftById(id, payload);
      } else {
        await createShifts(payload);
      }

      history.push("/shift");
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>

            {/* BACK BUTTON */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="error"
                onClick={() => history.push("/shift")}
              >
                BACK
              </Button>
            </Grid>

            {/* SHIFT NAME */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Shift Name *"
                {...register("name")}
                InputLabelProps={{ shrink: true }}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>

            {/* DATE + START + END horizontally */}
            <Grid item xs={12} container spacing={3}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Event date"
                  {...register("date")}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.date}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="time"
                  label="Start Time"
                  {...register("startTime")}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.startTime}
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="time"
                  label="End Time"
                  {...register("endTime")}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.endTime}
                />
              </Grid>
            </Grid>

            {/* SAVE BUTTON RIGHT */}
            <Grid item xs={12} style={{ textAlign: "right" }}>
              <Button type="submit" variant="contained" color="primary">
                SAVE
              </Button>
            </Grid>

          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShiftForm;
