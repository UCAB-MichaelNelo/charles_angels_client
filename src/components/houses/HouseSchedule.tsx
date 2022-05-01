import {
  AddOutlined,
  Collections,
  ConstructionOutlined,
  DeleteForeverOutlined,
} from "@mui/icons-material";
import { Button, Grid, Input, TextField } from "@mui/material";
import dayjs from "dayjs";
import React, { memo } from "react";
import {
  Control,
  Controller,
  FieldError,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { IMaskInput } from "react-imask";

type Record = {
  startTime: string;
  duration: string;
};

function toTimeRange({ startTime, duration }: Record) {
  const time = dayjs(startTime, ["HH:mm:ss", "HH:mm"]).local(),
    [hour, minute] = duration.includes(":")
      ? duration.split(":")
      : [duration, "0"],
    end = time.add(Number(hour), "hour").add(Number(minute), "minute");

  return [time, end];
}

function isIn(range: Record, point: Record) {
  const [start, end] = toTimeRange(range),
    [begin, _] = toTimeRange(point);

  return begin.isSameOrAfter(start) && begin.isSameOrBefore(end);
}

function areIntersected(r1: Record, r2: Record) {
  return isIn(r1, r2) || isIn(r2, r1);
}

type DurationProps = {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
};

const DurationMask = React.forwardRef<HTMLElement, DurationProps>(
  function DurationMask(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="00:00"
        inputRef={ref as any}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    );
  }
);

type StartTimeInputProps = {
  control: Control;
  index: number;
  name: string;
  startTime: FieldError;
  collection: any[];
  collisions: any;
};

const StartTimeInput = ({
  control,
  index,
  name,
  startTime,
  collection,
  collisions,
}: StartTimeInputProps) => {
  const keys = React.useMemo(() => [...collection.keys()], [collection.length]),
    bindex = React.useMemo(
      () =>
        keys.filter(
          (bindex) =>
            !!collisions?.[index]?.[bindex] || !!collisions?.[bindex]?.[index]
        ),
      [JSON.stringify(collisions), JSON.stringify(keys), index]
    );
  return (
    <Controller
      control={control}
      name={`${name}.${index}.startTime`}
      rules={{ required: true }}
      defaultValue="08:00:00"
      render={({ field }) => (
        <TextField
          fullWidth
          type="time"
          variant="outlined"
          label="Hora de Inicio"
          error={!!startTime || bindex.length != 0}
          helperText={
            startTime?.type == "required"
              ? "La hora de inicio no puede estar vacia"
              : bindex.length != 0
              ? `Este bloque y el bloque ${bindex
                  .map((i) => i + 1)
                  .join(", ")} colisionan`
              : ""
          }
          {...field}
        />
      )}
    />
  );
};

type Props = {
  name: string;
};

export default React.memo(function HouseSchedule({ name }: Props) {
  const {
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();
  const {
      fields: scheduleBlocks,
      append,
      remove,
    } = useFieldArray({
      control,
      name: name,
    }),
    schedule = useWatch({
      control,
      name,
    });

  React.useEffect(() => {
    schedule?.forEach((b1: any, index: number) => {
      const [time, end] = toTimeRange(b1);

      if (time.day() < end.day())
        setError(`${name}.${index}`, { type: "blockLength" });
      else clearErrors(`${name}.${index}`);
    });
  }, [schedule]);

  React.useEffect(() => {
    schedule?.forEach((b1: any, i: number) => {
      schedule?.forEach((b2: any, j: number) => {
        if (j == i) return;
        if (areIntersected(b1, b2))
          setError(`${name}.blocks.${i}.${j}`, { type: "collision" });
        else clearErrors(`${name}.blocks.${i}.${j}`);
      });
    });
  }, [schedule]);

  return (
    <>
      {scheduleBlocks.map((block, index) => {
        return (
          <React.Fragment key={block.id}>
            <Grid item xs={5}>
              <StartTimeInput
                control={control}
                index={index}
                name={name}
                startTime={errors?.[name]?.[index]?.startTime}
                collection={scheduleBlocks}
                collisions={errors?.[name]?.blocks}
              />
            </Grid>
            <Grid item xs={5}>
              <Controller
                control={control}
                name={`${name}.${index}.duration`}
                rules={{
                  required: true,
                  validate: value => {
                    const [hour, minute] = value.includes(":") ? value.split(":") : [value, "0"]
                    return (Number(hour) + Number(minute)) > 0
                  }
                }}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Duracion"
                    error={
                      !!errors?.[name]?.[index]?.duration ||
                      !!errors?.[name]?.[index]
                    }
                    helperText={
                      errors?.[name]?.[index]?.duration?.type == "required"
                        ? "La duracion no puede estar vacia"
                        : errors?.[name]?.[index]?.type == "blockLength"
                        ? "El bloque abarca más de un día, reduzca la duración"
                        : errors?.[name]?.[index]?.duration?.type == "validate"
                        ? "La duración no puede ser 0"
                        : ""
                    }
                    InputProps={{
                      inputComponent: DurationMask as any,
                    }}
                    {...field}
                  />
                )}
              />
            </Grid>
            <Grid item xs={1}>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  const indexes = [...scheduleBlocks.keys()];
                  clearErrors(`${name}.blocks.${index}`);
                  indexes.forEach((bindex) =>
                    clearErrors(`${name}.blocks.${bindex}.${index}`)
                  );
                  remove(index);
                }}
                sx={{ py: 1.2, mr: "auto" }}
              >
                <DeleteForeverOutlined fontSize="large" />
              </Button>
            </Grid>
          </React.Fragment>
        );
      })}
      <Grid item xs={11}>
        <Button
          fullWidth
          onClick={() => append({ startTime: "08:00:00", duration: "01:00" })}
          color="secondary"
        >
          <AddOutlined fontSize="large" />
        </Button>
      </Grid>
    </>
  );
});
