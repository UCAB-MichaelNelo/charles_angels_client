import {
  AddCircleOutline,
  AddOutlined,
  DeleteForeverOutlined,
  ErrorRounded,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { createHouse, isRIFUnique } from "../../api/houses";
import HouseSchedule from "./HouseSchedule";

export default function HouseForm() {
  const form = useForm<any>({
      mode: "all",
      defaultValues: {
        housePhones: [{ value: "" }],
      },
    }),
    {
      control,
      formState: { errors, isValid },
      watch,
      setError,
      register,
      clearErrors,
      handleSubmit,
    } = form,
    {
      fields: phoneFields,
      append: appendPhone,
      remove: phoneRemove,
    } = useFieldArray({
      control,
      name: "housePhones",
    }),
    minAge = watch("houseMinimumAge"),
    maxAge = watch("houseMaximumAge"),
    [loading, setLoading] = useState(false),
    [filename, setFilename] = useState<string | undefined>(),
    [confirmingRif, setConfirmingRif] = useState(false),
    fileField = register("houseImage", { required: false }),
    fileInput = useRef<{ el: HTMLInputElement | null }>({ el: null }),
    fileRef = (el: HTMLInputElement | null) => {
      fileField.ref(el);
      fileInput.current.el = el;
      el?.addEventListener("change", () => {
        const name = el?.files?.[0]?.name;
        if (name) setFilename(name);
      });
    },
    navigate = useNavigate(),
    onSubmit = (form: any) => {
      setLoading(true);
      createHouse(form)
        .catch(() => setLoading(false))
        .then(() => setLoading(false))
        .then(() => navigate("/casas"));
    },
    rif = watch("houseRif");

  React.useEffect(() => {
    if (
      Number(minAge) > Number(maxAge) &&
      errors.houseMaximumAge?.type != "coherent"
    ) {
      setError("houseMaximumAge", { type: "coherent" });
    } else if (Number(minAge) < Number(maxAge)) {
      clearErrors("houseMaximumAge");
    }
  }, [minAge, maxAge]);

  React.useEffect(() => {
    if (rif && rif.length == 9) {
      setConfirmingRif(true);
      isRIFUnique(rif).then((isUnique) => {
        if (!isUnique) setError("houseRif", { type: "unicity" });
        setConfirmingRif(false);
      });
    }
  }, [rif]);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Divider sx={{ color: "rgba(0,0,0,0.4)" }}>INFORMACION</Divider>
        </Grid>
        <Grid item xs={6}>
          <Controller
            control={control}
            name="houseName"
            rules={{ required: true, maxLength: 50 }}
            defaultValue=""
            render={({ field }) => {
              return (
                <TextField
                  fullWidth
                  error={!!errors.houseName}
                  variant="outlined"
                  label="Nombre de la Casa"
                  helperText={
                    errors.houseName?.type == "required"
                      ? "El nombre no puede estar vacio"
                      : errors.houseName?.type == "maxLength"
                      ? "El nombre no puede tener mas de 50 caracteres"
                      : ""
                  }
                  {...field}
                ></TextField>
              );
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <Controller
            control={control}
            name="houseRif"
            rules={{
              required: true,
              maxLength: 9,
              minLength: 9,
              pattern: /[123456789]+/,
            }}
            defaultValue=""
            render={({ field }) => (
              <TextField
                fullWidth
                disabled={confirmingRif}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">J-</InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {confirmingRif && <CircularProgress size="1.5em"/>}
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                label="RIF de la Casa"
                error={!!errors.houseRif}
                helperText={
                  errors.houseRif?.type == "required"
                    ? "El RIF no puede estart vacio"
                    : errors.houseRif?.type == "pattern"
                    ? "El RIF solo puede tener digitos"
                    : errors.houseRif?.type == "maxLength" ||
                      errors.houseRif?.type == "minLength"
                    ? "El RIF solo puede tener 9 numeros"
                    : errors.houseRif?.type == "unicity"
                    ? "El RIF no es unico"
                    : ""
                }
                {...field}
              ></TextField>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            control={control}
            defaultValue=""
            name="houseAddress"
            rules={{ required: true, maxLength: 255 }}
            render={({ field }) => (
              <TextField
                fullWidth
                multiline
                label="Dirección de la Casa"
                rows={8}
                placeholder="El Paraiso, Avenida Libertador..."
                error={!!errors.houseAddress}
                helperText={
                  errors.houseAddress?.type == "maxLength"
                    ? "La dirección no puede tener mas de 255 caracteres"
                    : errors.houseAddress?.type == "required"
                    ? "La dirección no puede estar vacía"
                    : ""
                }
                {...field}
              ></TextField>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            <label htmlFor="house-image">
              <input
                accept="image/*"
                type="file"
                style={{ display: "none" }}
                {...fileField}
                ref={fileRef}
              />
              <Button
                component="span"
                onClick={() => fileInput.current?.el?.click()}
                variant="contained"
              >
                Subir imagen de la Casa
              </Button>
            </label>
            <Typography component="span" variant="subtitle1">
              {filename || "Archivo sin seleccionar"}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Controller
            control={control}
            name="houseMaxShares"
            rules={{ required: true, min: 1 }}
            defaultValue={1}
            render={({ field }) => (
              <TextField
                fullWidth
                variant="outlined"
                type="number"
                label="Cupos Máximos"
                error={!!errors.houseMaxShares}
                helperText={
                  errors.houseMaxShares?.type == "required"
                    ? "Los cupos máximos no pueden estar vacíos"
                    : errors.houseMaxShares?.type == "min"
                    ? "Los cupos máximos no pueden ser menores que 1"
                    : ""
                }
                {...field}
              ></TextField>
            )}
          />
        </Grid>
        <Grid item xs={4}>
          <Controller
            control={control}
            name="houseMinimumAge"
            rules={{ required: true, min: 0 }}
            defaultValue={0}
            render={({ field }) => (
              <TextField
                fullWidth
                variant="outlined"
                type="number"
                label="Edad mínima para la entrada en la Casa"
                error={!!errors.houseMinimumAge}
                helperText={
                  errors.houseMinimumAge?.type == "required"
                    ? "La edad minima no puede estar vacía"
                    : errors.houseMinimumAge?.type == "min"
                    ? "La edad minima no puede ser menor que 0"
                    : ""
                }
                {...field}
              ></TextField>
            )}
          />
        </Grid>
        <Grid item xs={4}>
          <Controller
            control={control}
            name="houseMaximumAge"
            rules={{ required: true, min: 1 }}
            defaultValue={1}
            render={({ field }) => (
              <TextField
                fullWidth
                variant="outlined"
                type="number"
                label="Edad máxima para la estadía en la Casa"
                error={!!errors.houseMaximumAge}
                helperText={
                  errors.houseMaximumAge?.type == "required"
                    ? "La edad maxima no puede estar vacía"
                    : errors.houseMaximumAge?.type == "min"
                    ? "La edad maxima no puede ser menor que 1"
                    : errors.houseMaximumAge?.type == "coherent"
                    ? "La edad maxima no puede ser menor que la edad mínima"
                    : ""
                }
                {...field}
              ></TextField>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ color: "rgba(0,0,0,0.4)" }}>CONTACTO</Divider>
        </Grid>
        <Grid item xs={12}>
          <Controller
            control={control}
            name="houseContactCI"
            rules={{ required: true, maxLength: 9 }}
            defaultValue=""
            render={({ field }) => (
              <TextField
                fullWidth
                variant="outlined"
                type="number"
                label="Cédula de Identidad"
                error={!!errors.houseContactCI}
                helperText={
                  errors.houseContactCI?.type == "required"
                    ? "La cédula no puede estar vacía"
                    : errors.houseContactCI?.type == "maxLength"
                    ? "La cédula no puede tener más de 9 dígitos"
                    : ""
                }
                {...field}
              ></TextField>
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <Controller
            control={control}
            name="houseContactName"
            defaultValue=""
            rules={{ required: true, maxLength: 50 }}
            render={({ field }) => (
              <TextField
                fullWidth
                variant="outlined"
                label="Nombre"
                error={!!errors.houseContactName}
                helperText={
                  errors.houseContactName?.type == "required"
                    ? "El nombre no puede estar vacío"
                    : errors.houseContactName?.type == "maxLength"
                    ? "El nombre no puede tener más de 50 dígitos"
                    : ""
                }
                {...field}
              ></TextField>
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <Controller
            control={control}
            name="houseContactLastname"
            defaultValue=""
            rules={{ required: true, maxLength: 50 }}
            render={({ field }) => (
              <TextField
                fullWidth
                variant="outlined"
                label="Apellido"
                error={!!errors.houseContactLastname}
                helperText={
                  errors.houseContactLastname?.type == "required"
                    ? "El apellido no puede estar vacío"
                    : errors.houseContactLastname?.type == "maxLength"
                    ? "El apellido no puede tener más de 50 dígitos"
                    : ""
                }
                {...field}
              ></TextField>
            )}
          />
        </Grid>
        {}
        <Grid item xs={12}>
          <Divider sx={{ color: "rgba(0,0,0,0.4)" }}>TELÉFONOS</Divider>
        </Grid>
        {phoneFields.map((phone, index) => (
          <React.Fragment key={phone.id}>
            <Grid item xs={index == 0 ? 12 : 11}>
              <Controller
                control={control}
                defaultValue=""
                name={`housePhones.${index}.value`}
                rules={{
                  required: true,
                  pattern: /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
                }}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Teléfono"
                    error={!!errors.housePhones?.[index]?.value}
                    helperText={
                      errors.housePhones?.[index]?.value?.type == "pattern"
                        ? "El teléfono debe tener el formato 000-000-0000"
                        : ""
                    }
                    {...field}
                  ></TextField>
                )}
              />
            </Grid>
            {index != 0 && (
              <Grid item xs={1}>
                <Button
                  variant="contained"
                  color="error"
                  sx={{ py: 1.4, mr: "auto" }}
                  onClick={() => phoneRemove(index)}
                >
                  <DeleteForeverOutlined fontSize="large" />
                </Button>
              </Grid>
            )}
          </React.Fragment>
        ))}
        <Grid item xs={12}>
          <Button
            fullWidth
            color="secondary"
            onClick={() => appendPhone({ value: "" })}
          >
            <AddOutlined fontSize="large" />
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ color: "rgba(0,0,0,0.4)" }}>HORARIO</Divider>
        </Grid>
        <FormProvider {...form}>
          <Grid item xs={12}>
            <Grid container sx={{ py: 2 }} spacing={6}>
              <Grid item xs={6}>
                <Typography variant="h6">Lunes</Typography>
              </Grid>
              <Grid item xs={6} container spacing={2}>
                <HouseSchedule name="mondaySchedule" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">Martes</Typography>
              </Grid>
              <Grid item xs={6} container spacing={2}>
                <HouseSchedule name="tuesdaySchedule" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">Miercoles</Typography>
              </Grid>
              <Grid item xs={6} container spacing={2}>
                <HouseSchedule name="wednesdaySchedule" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">Jueves</Typography>
              </Grid>
              <Grid container item spacing={2} xs={6}>
                <HouseSchedule name="thursdaySchedule" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">Viernes</Typography>
              </Grid>
              <Grid container item xs={6} spacing={2}>
                <HouseSchedule name="fridaySchedule" />
              </Grid>
            </Grid>
          </Grid>
        </FormProvider>
      </Grid>
      <LoadingButton
        disabled={!isValid || Object.keys(errors).length > 0 || confirmingRif}
        loading={loading}
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        sx={{ mt: 4 }}
      >
        Guardar Casa
      </LoadingButton>
    </form>
  );
}
