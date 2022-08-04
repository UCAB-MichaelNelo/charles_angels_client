import {Control, Controller, useFormContext, useFormState} from "react-hook-form";
import {FormChild, PersonalInformation} from "../../types/children";
import {Autocomplete, CircularProgress, Grid, InputAdornment, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import {isCiValidForChild} from "../../api/children";
import {useAppSelector} from "../../store";
import {selectChild} from "../../store/children";

type Props = {
    firstColumnWidth?: number
    personalInformation: Record<string, PersonalInformation> | null
    noAuto?: boolean
    control: Control<FormChild, any>
    fieldName: "mother" | "father" | "information" | "nonParent",
    validateCiUniqueness?: boolean
    isForUpdate: boolean
}

export function PersonalInformationForm({
                                            control,
                                            validateCiUniqueness = false,
                                            personalInformation,
                                            noAuto = false,
                                            fieldName,
                                            isForUpdate,
                                            firstColumnWidth = 12
                                        }: Props) {
    const {errors} = useFormState({control}),
        child = useAppSelector(selectChild),
        {watch, setValue, resetField, setError, clearErrors} = useFormContext(),
        ci = watch(`${fieldName}.ci`),
        [validatingCi, setValidatingCi] = useState(false)

    if (validateCiUniqueness)
        useEffect(() => {
            if (child && child.information.ci == ci) return
            if ((errors?.[fieldName] as any)?.ci || !ci) return

            setValidatingCi(true)

            isCiValidForChild(ci).then(isValid => {
                setValidatingCi(false)

                if (!isValid)
                    setError(`${fieldName}.ci`, {type: 'unicity'})
                else
                    clearErrors(`${fieldName}.ci`)
            })
        }, [ci])

    if (!noAuto)
        useEffect(() => {
            const selectedPersonalInformation = personalInformation?.[ci]

            if (selectedPersonalInformation) {
                setValue(`${fieldName}.name`, selectedPersonalInformation.name)
                setValue(`${fieldName}.lastname`, selectedPersonalInformation.lastname)
                setValue(`${fieldName}.birthdate`, selectedPersonalInformation.birthdate)
            } else {
                resetField(`${fieldName}.name`)
                resetField(`${fieldName}.lastname`)
                resetField(`${fieldName}.birthdate`)
            }
        }, [ci])

    return (
        <>
            <Grid item xs={firstColumnWidth}>
                <Controller
                    control={control}
                    name={`${fieldName}.ci`}
                    defaultValue={""}
                    rules={{required: true, maxLength: 9}}
                    render={({field: {onChange, ...field}}) => {
                        return !noAuto ? (
                            <Autocomplete
                                freeSolo={!isForUpdate}
                                disableClearable
                                fullWidth
                                options={personalInformation ? Object.keys(personalInformation) : []}
                                renderOption={(props, ci) => {
                                    const nci = Number(ci)
                                    return (
                                        <span {...props}>
                                            {personalInformation?.[nci]?.name} {personalInformation?.[nci]?.lastname} ({ci})
                                        </span>
                                    )
                                }
                                }
                                loading={!personalInformation}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        error={!!(errors?.[fieldName] as any)?.ci}
                                        variant="outlined"
                                        label="Cédula de identidad"
                                        type="number"
                                        helperText={
                                            (errors?.[fieldName] as any)?.ci?.type == "required"
                                                ? "La cédula no puede estar vacía"
                                                : (errors?.[fieldName] as any)?.ci?.type == "maxLength"
                                                    ? "La cédula no puede tener más de 9 dígitos"
                                                    : ""
                                        }
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <InputAdornment position={"end"}>
                                                    {(!personalInformation || validatingCi) &&
                                                        <CircularProgress size="medium"/>}
                                                </InputAdornment>
                                            )
                                        }}
                                    ></TextField>)}
                                {...field}
                                value={field.value?.toString() ?? ""}
                                onInputChange={isForUpdate ? undefined : (_, data) => onChange(data)}
                                onChange={isForUpdate ? (_, data) => onChange(data) : undefined }
                            />
                        ) : (
                            <TextField
                                fullWidth
                                error={!!(errors?.[fieldName] as any)?.ci}
                                variant="outlined"
                                label="Cédula de identidad"
                                type="number"
                                helperText={
                                    (errors?.[fieldName] as any)?.ci?.type == "required"
                                        ? "La cédula no puede estar vacía"
                                        : (errors?.[fieldName] as any)?.ci?.type == "maxLength"
                                            ? "La cédula no puede tener más de 9 dígitos"
                                            : (errors?.[fieldName] as any)?.ci?.type == "unicity"
                                                ? "Esta cédula ya está en uso por otra persona"
                                                : ""
                                }
                                onChange={onChange}
                                {...field}
                                value={field.value?.toString() ?? ""}
                            ></TextField>
                        );
                    }}
                />
            </Grid>
            <Grid item xs={4}>
                <Controller
                    control={control}
                    defaultValue=""
                    name={`${fieldName}.name`}
                    rules={{required: true, maxLength: 50}}
                    render={({field}) => {
                        return (
                            <TextField
                                fullWidth
                                error={!!(errors?.[fieldName] as any)?.name}
                                variant="outlined"
                                label="Nombre"
                                helperText={
                                    (errors?.[fieldName] as any)?.name?.type == "required"
                                        ? "El nombre no puede estar vacío"
                                        : errors?.information?.name?.type == "maxLength"
                                            ? "El nombre no puede tener más de 50 caracteres"
                                            : ""
                                }
                                {...field}
                                value={field.value?.toString() ?? ""}
                                InputProps={{
                                    readOnly: isForUpdate && !noAuto
                                }}
                            ></TextField>
                        );
                    }}
                />
            </Grid>
            <Grid item xs={4}>
                <Controller
                    control={control}
                    name={`${fieldName}.lastname`}
                    rules={{required: true, maxLength: 75}}
                    defaultValue=""
                    render={({field}) => {
                        return (
                            <TextField
                                fullWidth
                                error={!!(errors?.[fieldName] as any)?.lastname}
                                variant="outlined"
                                label="Apellido"
                                helperText={
                                    (errors?.[fieldName] as any)?.lastname?.type == "required"
                                        ? "El apellido no puede estar vacío"
                                        : errors?.information?.lastname?.type == "maxLength"
                                            ? "El apellido no puede tener más de 75 caracteres"
                                            : ""
                                }
                                {...field}
                                value={field.value?.toString() ?? ""}
                                InputProps={{
                                    readOnly: isForUpdate && !noAuto
                                }}
                            ></TextField>
                        );
                    }}
                />
            </Grid>
            <Grid item xs={4}>
                <Controller
                    control={control}
                    name={`${fieldName}.birthdate`}
                    rules={{required: true}}
                    defaultValue={"1999-12-01"}
                    render={({field}) => {
                        return (
                            <TextField
                                fullWidth
                                error={!!(errors?.[fieldName] as any)?.birthdate}
                                variant="outlined"
                                label="Fecha de nacimiento"
                                type="date"
                                helperText={
                                    (errors?.[fieldName] as any)?.birthdate?.type == "required"
                                        ? "El apellido no puede estar vacío"
                                        : ""
                                }
                                {...field}
                                value={field.value?.toString() ?? "1999-12-01"}
                                InputProps={{
                                    readOnly: isForUpdate && !noAuto
                                }}
                            ></TextField>
                        );
                    }}
                />
            </Grid>
        </>
    )
}